const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
	codigo: {
		type: String,
		required: [true, 'El código es obligatorio'],
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
});

const VentaSchema = new Schema({
	productos: {
		type: [ProductoSchema],
		required: true,
	},
	totalProductos: {
		type: Number,
		required: true,
	},
	precioTotal: {
		type: Number,
		required: true,
	},
	fecha: {
		type: Date,
		required: true,
		default: Date.now,
	},
	gestor: {
		type: String,
		enum: ['Elena', 'Milton', 'Liset', 'Berardo', 'Monaco', 'AnaMaria', 'Greter', 'Wilson', 'Jazmin', 'Ninguno'],
		required: true,
	},
});

VentaSchema.methods.toJSON = function () {
	const { __v, _id, ...venta } = this.toObject();
	venta.uid = _id;
	return venta;
};

module.exports = model('Venta', VentaSchema);
