const { response, request } = require('express');
const Producto = require('../models/producto');

const productosGet = async (req, res) => {
	try {
		const { limit = 8, page = 1, search } = req.query;
		const offset = (page - 1) * limit;

		const query = {};
		if (search) {
			query.nombre = new RegExp(search, 'i'); // Búsqueda insensible a mayúsculas
		}

		const [total, productos] = await Promise.all([
			Producto.countDocuments(query),
			Producto.find(query).skip(offset).limit(Number(limit)),
		]);

		res.json({
			total,
			productos,
			page: Number(page),
			limit: Number(limit),
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error('Error al obtener los productos:', error);
		res.status(500).json({
			msg: 'Error al obtener los productos',
			error: error.message,
		});
	}
};

const productosGetAll = async (req, res) => {
	try {
		const productos = await Producto.find();

		res.json({
			total: productos.length,
			productos,
		});
	} catch (error) {
		console.error('Error al obtener los productos:', error);
		res.status(500).json({
			msg: 'Error al obtener los productos',
			error: error.message,
		});
	}
};

const productosBuscar = async (req, res) => {
	const { page, limit, search } = req.query;
	const productos = await Producto.find({
		nombre: { $regex: search, $options: 'i' }, // Buscar por nombre (insensible a mayúsculas)
	})
		.skip((page - 1) * limit)
		.limit(Number(limit));

	const totalProductos = await Producto.countDocuments({
		nombre: { $regex: search, $options: 'i' },
	});

	res.json({ productos, totalPages: Math.ceil(totalProductos / limit) });
};

const productosPost = async (req, res) => {
	const { nombre, codigo, descripcion, existencia, costo, venta, url, precioGestor } = req.body;

	try {
		const newProducto = new Producto({
			nombre,
			codigo,
			descripcion,
			existencia,
			costo,
			venta,
			url,
			precioGestor,
		});

		await newProducto.save();
		res.status(201).json(newProducto);
	} catch (error) {
		console.error('Error al crear producto:', error);
		res.status(500).json({ error: error.message });
	}
};

const productosPut = async (req, res) => {
	const { id } = req.params;
	const { nombre, codigo, descripcion, existencia, costo, venta, url, precioGestor } = req.body;

	try {
		const productoExistente = await Producto.findById(id);
		if (!productoExistente) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}

		productoExistente.nombre = nombre !== undefined ? nombre : productoExistente.nombre;
		productoExistente.codigo = codigo !== undefined ? codigo : productoExistente.codigo;
		productoExistente.descripcion = descripcion !== undefined ? descripcion : productoExistente.descripcion;
		productoExistente.existencia = existencia !== undefined ? existencia : productoExistente.existencia;
		productoExistente.costo = costo !== undefined ? costo : productoExistente.costo;
		productoExistente.venta = venta !== undefined ? venta : productoExistente.venta;
		productoExistente.precioGestor = precioGestor !== undefined ? precioGestor : productoExistente.precioGestor;
		productoExistente.url = url !== undefined ? url : productoExistente.url;

		await productoExistente.save();
		res.status(200).json(productoExistente);
	} catch (error) {
		console.error('Error al actualizar producto:', error);
		res.status(500).json({ error: error.message });
	}
};

const getProductoPorId = async (req, res) => {
	try {
		const producto = await Producto.findById(req.params.id);
		if (!producto) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}
		res.json(producto);
	} catch (error) {
		console.error('Error al obtener el producto:', error);
		res.status(500).json({ msg: 'Error del servidor', error: error.message });
	}
};

const productoDelete = async (req, res) => {
	const { id } = req.params;

	try {
		const producto = await Producto.findById(id);
		if (!producto) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}
		await producto.deleteOne();
		res.status(200).json({ msg: 'Producto eliminado' });
	} catch (error) {
		console.error('Error al eliminar producto:', error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	productosGet,
	productosGetAll,
	productosPut,
	productosPost,
	productoDelete,
	productosBuscar,
	getProductoPorId,
};
