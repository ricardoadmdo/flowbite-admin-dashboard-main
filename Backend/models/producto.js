const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Producto = sequelize.define(
	'Producto',
	{
		nombre: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: 'El nombre es obligatorio',
				},
			},
		},
		precio: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		precioCosto: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		cantidadTienda: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		cantidadAlmacen: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		url: {
			type: DataTypes.STRING,
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

module.exports = Producto;
