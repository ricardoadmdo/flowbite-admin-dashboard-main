const { response, request } = require("express");
const Venta = require("../models/venta");
const Producto = require("../models/producto");

// Crear una nueva venta
const createVenta = async (req, res) => {
	const { productos, cliente, gestor, ...datos } = req.body;

	try {
		if (!productos || productos.length === 0) {
			return res.status(400).json({ message: "No hay productos en la venta." });
		}

		if (!cliente || !cliente.nombre || !cliente.carnet || !cliente.direccion) {
			return res.status(400).json({ message: "Los datos del cliente están incompletos." });
		}

		// Ajustar el campo gestor si está vacío o nulo
		const gestorAjustado =
			(gestor && (gestor.nombre && gestor.nombre.trim().length > 0 ? gestor.nombre : "Ninguno")) || "Ninguno";

		const inicioDia = new Date();
		inicioDia.setHours(0, 0, 0, 0);
		const finDia = new Date();
		finDia.setHours(23, 59, 59, 999);

		// Obtener el último código de factura del día actual
		const ultimaVenta = await Venta.findOne({ fecha: { $gte: inicioDia, $lte: finDia } }, { codigoFactura: 1 })
			.sort({ codigoFactura: -1 })
			.exec();

		const ultimoCodigo = ultimaVenta ? parseInt(ultimaVenta.codigoFactura, 10) : 0;
		const nuevoCodigoFactura = (ultimoCodigo + 1).toString().padStart(4, "0");

		// Crear la venta con el nuevo código
		const nuevaVenta = new Venta({
			...datos,
			productos,
			cliente,
			gestor: gestorAjustado, // Usar el gestor ajustado
			codigoFactura: nuevoCodigoFactura,
		});
		await nuevaVenta.save();

		// Actualizar las existencias de los productos
		for (const producto of productos) {
			const productoActual = await Producto.findOne({ codigo: producto.codigo });

			if (!productoActual) {
				return res.status(404).json({ message: `Producto con código ${producto.codigo} no encontrado.` });
			}

			if (productoActual.existencia < producto.cantidad) {
				return res
					.status(400)
					.json({ message: `No hay suficiente existencia del producto ${producto.nombre}.` });
			}

			productoActual.existencia -= producto.cantidad;
			await productoActual.save();
		}

		// Emitir el siguiente código al frontend
		const siguienteCodigoFactura = (ultimoCodigo + 2).toString().padStart(4, "0");
		req.io.emit("actualizarCodigoFactura", siguienteCodigoFactura);

		res.status(201).json({ message: "Venta registrada", codigoFactura: nuevoCodigoFactura });
	} catch (error) {
		console.error("Error al registrar la venta:", error);
		res.status(500).json({ message: "Error al registrar la venta." });
	}
};

const getProductosVendidosHoy = async (req, res) => {
	try {
		const fechaActual = new Date();
		const inicioDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
		const finDia = new Date(inicioDia);
		finDia.setHours(23, 59, 59, 999);

		const productosVendidos = await Venta.aggregate([
			{ $match: { fecha: { $gte: inicioDia, $lt: finDia } } },
			{ $unwind: "$productos" },
			{
				$group: {
					_id: "$productos.nombre", // Agrupa por nombre del producto
					total: { $sum: "$productos.cantidad" }, // Suma las cantidades vendidas
				},
			},
			{ $sort: { total: -1 } }, // Ordena por cantidad vendida en orden descendente
		]);

		res.status(200).json(productosVendidos);
	} catch (error) {
		console.error("Error al obtener los productos vendidos hoy:", error);
		res.status(500).json({ error: "Error al procesar la solicitud." });
	}
};

const getProductoMasVendidoDiario = async (req, res) => {
	try {
		const fechaActual = new Date();
		const mesActual = fechaActual.getMonth();
		const anioActual = fechaActual.getFullYear();

		const inicioMes = new Date(anioActual, mesActual, 1);
		const finMes = new Date(anioActual, mesActual + 1, 1);

		const productosMasVendidos = await Venta.aggregate([
			{ $match: { fecha: { $gte: inicioMes, $lt: finMes } } },
			{ $unwind: "$productos" },
			{
				$group: {
					_id: { dia: { $dayOfMonth: "$fecha" }, producto: "$productos.nombre" },
					totalCantidad: { $sum: "$productos.cantidad" },
				},
			},
			{ $sort: { "_id.dia": 1, "totalCantidad": -1 } },
			{
				$group: {
					_id: "$_id.dia",
					producto: { $first: "$_id.producto" },
					total: { $first: "$totalCantidad" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(productosMasVendidos);
	} catch (error) {
		console.error("Error al obtener el producto más vendido diario:", error);
		res.status(500).json({ error: "Error al procesar la solicitud." });
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
		console.error("Error al obtener las ventas:", error);
		res.status(500).json({
			msg: "Error al obtener las ventas",
			error: error.message,
		});
	}
};

const getUltimoCodigoFactura = async (req, res) => {
	try {
		// Obtener el inicio y el final del día de hoy
		const inicioDia = new Date();
		inicioDia.setHours(0, 0, 0, 0); // Medianoche
		const finDia = new Date();
		finDia.setHours(23, 59, 59, 999); // Final del día

		// Buscar la venta con el mayor código de factura dentro del día actual
		const ultimaVenta = await Venta.findOne(
			{ fecha: { $gte: inicioDia, $lte: finDia } }, // Filtro por fecha del día actual
			{ codigoFactura: 1 }
		)
			.sort({ codigoFactura: -1 }) // Ordenar por código de factura en orden descendente
			.exec();

		// Obtener el último código de factura y calcular el siguiente
		const ultimoCodigoFactura = ultimaVenta ? parseInt(ultimaVenta.codigoFactura, 10) : 0;
		const proximoCodigoFactura = (ultimoCodigoFactura + 1).toString().padStart(4, "0");

		// Responder al cliente
		res.status(200).json({ proximoCodigoFactura });
	} catch (error) {
		console.error("Error al obtener el último código de factura:", error.message);
		res.status(500).json({ message: "Error al obtener el último código de factura" });
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
		console.error("Error al obtener todas las ventas del día:", error);
		res.status(500).json({
			msg: "Error al obtener todas las ventas del día",
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
					_id: { $dayOfMonth: "$fecha" },
					total: { $sum: "$precioTotal" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasMensuales);
	} catch (error) {
		console.error("Error al obtener las ventas del mes:", error);
		res.status(500).json({ error: "Error al obtener las ventas del mes" });
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
					_id: { dia: { $dayOfMonth: "$fecha" }, gestor: "$gestor" },
					total: { $sum: "$precioTotal" },
				},
			},
			{ $sort: { "_id.dia": 1, "total": -1 } }, // Ordenar por día y luego por total en orden descendente
		]);

		// Filtrar gestores que no son "Ninguno"
		const ventasFiltradas = ventasMensuales.filter((venta) => venta._id.gestor.toLowerCase() !== "ninguno");

		// Encontrar el gestor con mayor venta por día
		const ventasMaximasPorDia = [];
		let currentDay = null;
		ventasFiltradas.forEach((venta) => {
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
		console.error("Error al obtener las ventas del mes:", error);
		res.status(500).json({ error: "Error al obtener las ventas del mes" });
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
					_id: { $month: "$fecha" },
					total: { $sum: "$precioTotal" }, // Cambié '$total' a '$precioTotal' para mantener consistencia
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json(ventasAnuales);
	} catch (error) {
		console.error("Error al obtener las ventas del año:", error);
		res.status(500).json({ error: "Error al obtener las ventas del año" });
	}
};

const deleteVenta = async (req = request, res = response) => {
	const { id } = req.params;

	try {
		const ventaEliminada = await Venta.findByIdAndDelete(id);

		if (!ventaEliminada) {
			return res.status(404).json({ message: "Venta no encontrada" });
		}

		res.status(200).json({ message: "Venta eliminada con éxito" });
	} catch (error) {
		console.error("Error al eliminar venta:", error);
		res.status(500).json({ message: "Error al eliminar venta" });
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
	getProductoMasVendidoDiario,
	getProductosVendidosHoy,
};
