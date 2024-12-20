const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

const Usuario = sequelize.define(
	'Usuario',
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
		contrasena: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: 'El password es obligatorio',
				},
			},
		},
		usuario: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: 'El usuario es obligatorio',
				},
			},
		},
		rol: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: {
					args: [['ADMIN_ROLE', 'USER_ROLE']],
					msg: 'El rol debe ser ADMIN_ROLE o USER_ROLE',
				},
			},
		},
	},
	{
		toJSON: {
			transform: (doc, ret) => {
				ret.uid = ret.id;
				delete ret.id;
				delete ret.password;
			},
		},
	}
);

module.exports = Usuario;
