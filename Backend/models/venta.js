const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Producto = sequelize.define('Producto', {
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
	cantidad: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
});

const Venta = sequelize.define('Venta', {
	totalProductos: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	precioTotal: {
		type: DataTypes.FLOAT,
		allowNull: false,
	},
});

// Definir la relación entre Venta y Producto
Venta.hasMany(Producto, { as: 'productos' });
Producto.belongsTo(Venta);

module.exports = {
	Venta,
	Producto,
};
