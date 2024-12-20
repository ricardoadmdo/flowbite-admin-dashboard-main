const { Op } = require('sequelize');
const Venta = require('../models/venta');
const Producto = require('../models/producto');

// Obtener todas las ventas con paginación y filtros
const getVentas = async (req, res) => {
	const { page = 1, limit = 10, startDate, endDate } = req.query;
	const offset = (page - 1) * limit;

	let where = {};

	if (startDate && endDate) {
		where.fecha = {
			[Op.gte]: new Date(startDate),
			[Op.lt]: new Date(endDate),
		};
	}

	try {
		const { count, rows } = await Venta.findAndCountAll({
			where,
			offset: Number(offset),
			limit: Number(limit),
			include: [{ model: Producto, as: 'productos' }],
		});

		res.status(200).json({
			total: count,
			ventas: rows,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(count / limit),
		});
	} catch (error) {
		console.error('Error al obtener las ventas:', error);
		res.status(500).json({
			msg: 'Error al obtener las ventas',
			error: error.message,
		});
	}
};

// Crear una nueva venta
const createVenta = async (req, res) => {
	const { totalProductos, precioTotal, productos } = req.body;

	try {
		const nuevaVenta = await Venta.create(
			{
				totalProductos,
				precioTotal,
				productos,
			},
			{
				include: [{ model: Producto, as: 'productos' }],
			}
		);

		res.status(201).json(nuevaVenta);
	} catch (error) {
		console.error('Error al crear la venta:', error);
		res.status(500).json({ error: error.message });
	}
};

// Eliminar una venta
const deleteVenta = async (req, res) => {
	const { id } = req.params;

	try {
		const venta = await Venta.findByPk(id);
		if (!venta) {
			return res.status(404).json({ msg: 'Venta no encontrada' });
		}

		await venta.destroy();
		res.status(200).json({ msg: 'Venta eliminada' });
	} catch (error) {
		console.error('Error al eliminar la venta:', error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getVentas,
	createVenta,
	deleteVenta,
};
