const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');
const Producto = require('./producto');

const Venta = sequelize.define(
	'Venta',
	{
		totalProductos: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		precioTotal: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
	},
	{
		toJSON: {
			transform: (doc, ret) => {
				ret.uid = ret.id;
				delete ret.id;
				delete ret.__v;
			},
		},
	}
);

// Definir la relación entre Venta y Producto
Venta.hasMany(Producto, { as: 'productos' });
Producto.belongsTo(Venta);

module.exports = Venta;
