const Producto = require('../models/producto');

// Obtener todos los productos
const productosGet = async (req, res) => {
	try {
		const productos = await Producto.findAll();
		res.status(200).json(productos);
	} catch (error) {
		console.error('Error al obtener productos:', error);
		res.status(500).json({ error: error.message });
	}
};

// Crear un nuevo producto
const productosPost = async (req, res) => {
	const { nombre, precio, precioCosto, cantidadTienda, cantidadAlmacen, url } = req.body;

	try {
		const nuevoProducto = await Producto.create({
			nombre,
			precio,
			precioCosto,
			cantidadTienda,
			cantidadAlmacen,
			url,
		});
		res.status(201).json(nuevoProducto);
	} catch (error) {
		console.error('Error al crear producto:', error);
		res.status(500).json({ error: error.message });
	}
};

// Actualizar un producto
const productosPut = async (req, res) => {
	const { id } = req.params;
	const { nombre, precio, precioCosto, cantidadTienda, cantidadAlmacen, url } = req.body;

	try {
		const producto = await Producto.findByPk(id);
		if (!producto) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}

		producto.nombre = nombre;
		producto.precio = precio;
		producto.precioCosto = precioCosto;
		producto.cantidadTienda = cantidadTienda;
		producto.cantidadAlmacen = cantidadAlmacen;
		producto.url = url;

		await producto.save();
		res.status(200).json(producto);
	} catch (error) {
		console.error('Error al actualizar producto:', error);
		res.status(500).json({ error: error.message });
	}
};

// Eliminar un producto
const productoDelete = async (req, res) => {
	const { id } = req.params;

	try {
		const producto = await Producto.findByPk(id);
		if (!producto) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}
		await producto.destroy();
		res.status(200).json({ msg: 'Producto eliminado' });
	} catch (error) {
		console.error('Error al eliminar producto:', error);
		res.status(500).json({ error: error.message });
	}
};

// Buscar productos por nombre
const productosBuscar = async (req, res) => {
	const { nombre } = req.query;

	try {
		const productos = await Producto.findAll({
			where: {
				nombre: {
					[Op.like]: `%${nombre}%`,
				},
			},
		});
		res.status(200).json(productos);
	} catch (error) {
		console.error('Error al buscar productos:', error);
		res.status(500).json({ error: error.message });
	}
};

// Obtener producto por ID
const getProductoPorId = async (req, res) => {
	const { id } = req.params;

	try {
		const producto = await Producto.findByPk(id);
		if (!producto) {
			return res.status(404).json({ msg: 'Producto no encontrado' });
		}
		res.status(200).json(producto);
	} catch (error) {
		console.error('Error al obtener producto:', error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	productosGet,
	productosPut,
	productosPost,
	productoDelete,
	productosBuscar,
	getProductoPorId,
};
