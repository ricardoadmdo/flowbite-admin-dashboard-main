const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
	cantidad: {
		type: Number,
		required: true,
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
});

const ClienteSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio'],
	},
	carnet: {
		type: String,
		required: [true, 'El carnet de identidad es obligatorio'],
	},
	direccion: {
		type: String,
		required: [true, 'La dirección es obligatoria'],
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
	codigoFactura: {
		type: String,
		required: true,
		unique: true,
	},
	cliente: {
		type: ClienteSchema,
		required: true,
	},
});

VentaSchema.methods.toJSON = function () {
	const { __v, _id, ...venta } = this.toObject();
	venta.uid = _id;
	return venta;
};

module.exports = model('Venta', VentaSchema);
