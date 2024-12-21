const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
	codigo: {
		type: String,
		required: [true, 'El código es obligatorio'],
		unique: true, // Código único por producto
	},
	descripcion: {
		type: String,
		required: [true, 'La descripción es obligatoria'],
	},
	existencia: {
		type: Number,
		required: [true, 'La existencia es obligatoria'],
		min: 0, // No permite valores negativos
	},
	costo: {
		type: Number,
		required: [true, 'El costo es obligatorio'],
		min: 0,
	},
	venta: {
		type: Number,
		required: [true, 'El precio de venta es obligatorio'],
		min: 0,
	},
	impuestoCosto: {
		type: Number,
		required: [true, 'El impuesto de costo es obligatorio'],
		min: 0,
	},
	impuestoVenta: {
		type: Number,
		required: [true, 'El impuesto de venta es obligatorio'],
		min: 0,
	},
	url: {
		type: String,
		required: [true, 'La URL de la imagen es obligatoria'],
	},
});

ProductoSchema.methods.toJSON = function () {
	const { __v, _id, ...producto } = this.toObject();
	producto.uid = _id;
	return producto;
};

module.exports = model('Producto', ProductoSchema);
