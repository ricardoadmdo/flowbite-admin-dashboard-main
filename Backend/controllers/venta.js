const { response, request } = require('express');
const Venta = require('../models/venta');
const Producto = require('../models/producto');

// Crear una nueva venta
const createVenta = async (req, res) => {
	const { productos, cliente, gestor, ...datos } = req.body;

	try {
		// Verifica que los campos requeridos estén presentes
		if (!datos || !productos || productos.length === 0) {
			return res.status(400).json({ message: 'Campos requeridos faltantes' });
		}

		// Verifica que los datos del cliente no estén vacíos
		if (!cliente.nombre || !cliente.carnet || !cliente.direccion) {
			return res.status(400).json({ message: 'Datos del cliente incompletos' });
		}

		// Ajusta el campo gestor si es una cadena vacía
		const gestorAjustado = gestor.nombre === '' ? 'Ninguno' : gestor.nombre;

		// Crear un nuevo objeto Venta con los datos recibidos
		const nuevaVenta = new Venta({ ...datos, productos, cliente, gestor: gestorAjustado });

		// Guardar la nueva venta en la base de datos
		await nuevaVenta.save();

		// Actualizar cantidades de productos
		for (let producto of productos) {
			await Producto.findByIdAndUpdate(producto.uid, { $inc: { existencia: -producto.cantidad } });
		}

		// Devolver la nueva venta
		res.status(201).json(nuevaVenta);
	} catch (error) {
		console.error('Error al crear venta:', error.message);
		res.status(500).json({ message: 'Error al crear venta' });
	}
};

const getVentas = async (req = request, res = response) => {
	try {
		const { day, month, year, limit = 8, page = 1 } = req.query;
		const skip = (page - 1) * limit;
		let query = {};

		// Verificar si se ha proporcionado una fecha
		if (day && month && year) {
			const startDate = new Date(year, month - 1, day);
			const endDate = new Date(year, month - 1, day);
			endDate.setHours(23, 59, 59, 999);

			query.fecha = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		const [ventas, total] = await Promise.all([
			Venta.find(query).skip(Number(skip)).limit(Number(limit)),
			Venta.countDocuments(query),
		]);

		res.status(200).json({
			total,
			ventas,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error('Error al obtener las ventas:', error);
		res.status(500).json({
			msg: 'Error al obtener las ventas',
			error: error.message,
		});
	}
};

const getUltimoCodigoFactura = async (req, res) => {
	try {
		const ultimaVenta = await Venta.findOne({}, { codigoFactura: 1 }).sort({ fecha: -1 }).exec();
		const ultimoCodigoFactura = ultimaVenta ? ultimaVenta.codigoFactura : null;
		res.status(200).json({ ultimoCodigoFactura });
	} catch (error) {
		console.error('Error al obtener el último código de factura:', error.message);
		res.status(500).json({ message: 'Error al obtener el último código de factura' });
	}
};

const getAllVentasByDay = async (req = request, res = response) => {
	try {
		const { day, month, year } = req.query;
		let query = {};

		// Verificar si se ha proporcionado una fecha
		if (day && month && year) {
			const startDate = new Date(year, month - 1, day);
			const endDate = new Date(year, month - 1, day);
			endDate.setHours(23, 59, 59, 999);

			query.fecha = {
				$gte: startDate,
				$lt: endDate,
			};
		}

		const ventas = await Venta.find(query);

		res.status(200).json({
			ventas,
		});
	} catch (error) {
		console.error('Error al obtener todas las ventas del día:', error);
		res.status(500).json({
			msg: 'Error al obtener todas las ventas del día',
			error: error.message,
		});
	}
};

const getVentasPorMes = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth(); // Índice del mes (0-11)
		const anioActual = fechaActual.getFullYear();

		// Inicio y fin del mes
		const inicioMes = new Date(anioActual, mesActual, 1); // 1er día del mes
		const finMes = new Date(anioActual, mesActual + 1, 1); // 1er día del siguiente mes

		const ventasMensuales = await Venta.aggregate([
			{
				$match: {
					fecha: { $gte: inicioMes, $lt: finMes },
				},
			},
			{
				$group: {
					_id: { $dayOfMonth: '$fecha' },
					total: { $sum: '$precioTotal' },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasMensuales);
	} catch (error) {
		console.error('Error al obtener las ventas del mes:', error);
		res.status(500).json({ error: 'Error al obtener las ventas del mes' });
	}
};
const getVentasPorMesGestor = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth(); // Índice del mes (0-11)
		const anioActual = fechaActual.getFullYear();

		// Inicio y fin del mes
		const inicioMes = new Date(anioActual, mesActual, 1); // 1er día del mes
		const finMes = new Date(anioActual, mesActual + 1, 1); // 1er día del siguiente mes

		const ventasMensuales = await Venta.aggregate([
			{
				$match: {
					fecha: { $gte: inicioMes, $lt: finMes },
				},
			},
			{
				$group: {
					_id: { dia: { $dayOfMonth: '$fecha' }, gestor: '$gestor' },
					total: { $sum: '$precioTotal' },
				},
			},
			{ $sort: { '_id.dia': 1, 'total': -1 } }, // Ordenar por día y luego por total en orden descendente
		]);

		// Encontrar el gestor con mayor venta por día
		const ventasMaximasPorDia = [];
		let currentDay = null;
		ventasMensuales.forEach((venta) => {
			if (venta._id.dia !== currentDay) {
				ventasMaximasPorDia.push({
					dia: venta._id.dia,
					gestor: venta._id.gestor,
					total: venta.total,
				});
				currentDay = venta._id.dia;
			}
		});

		res.status(200).json(ventasMaximasPorDia);
	} catch (error) {
		console.error('Error al obtener las ventas del mes:', error);
		res.status(500).json({ error: 'Error al obtener las ventas del mes' });
	}
};

const getVentasPorAno = async (req, res) => {
	try {
		const anioActual = new Date().getFullYear();

		// Inicio y fin del año
		const inicioAno = new Date(anioActual, 0, 1); // 1er día del año
		const finAno = new Date(anioActual + 1, 0, 1); // 1er día del siguiente año

		const ventasAnuales = await Venta.aggregate([
			{
				$match: {
					fecha: {
						$gte: inicioAno,
						$lt: finAno,
					},
				},
			},
			{
				$group: {
					_id: { $month: '$fecha' },
					total: { $sum: '$precioTotal' }, // Cambié '$total' a '$precioTotal' para mantener consistencia
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasAnuales);
	} catch (error) {
		console.error('Error al obtener las ventas del año:', error);
		res.status(500).json({ error: 'Error al obtener las ventas del año' });
	}
};

const deleteVenta = async (req = request, res = response) => {
	const { id } = req.params;

	try {
		const ventaEliminada = await Venta.findByIdAndDelete(id);

		if (!ventaEliminada) {
			return res.status(404).json({ message: 'Venta no encontrada' });
		}

		res.status(200).json({ message: 'Venta eliminada con éxito' });
	} catch (error) {
		console.error('Error al eliminar venta:', error);
		res.status(500).json({ message: 'Error al eliminar venta' });
	}
};

module.exports = {
	createVenta,
	getVentas,
	deleteVenta,
	getVentasPorAno,
	getVentasPorMes,
	getVentasPorMesGestor,
	getAllVentasByDay,
	getUltimoCodigoFactura,
};
