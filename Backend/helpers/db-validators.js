const Role = require('../models/role');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const esRoleValido = async (rol = '') => {
	if (rol === '') {
		rol = 'USER_ROLE';
	}
	const existeRol = await Role.findOne({ rol });
	if (!existeRol) {
		throw new Error(`El rol ${rol} no está registrado en la BD`);
	}
};

const emailExiste = async (correo = '') => {
	const existeEmail = await Usuario.findOne({ correo });
	if (existeEmail) {
		throw new Error(`El correo: ${correo}, ya está registrado en la BD`);
	}
};

const existeUsuarioPorId = async (id) => {
	const existeUsuario = await Usuario.findById(id);
	if (!existeUsuario) {
		throw new Error(`El id no existe: ${id}`);
	}
};
const existeProductoPorId = async (id) => {
	const existeProducto = await Producto.findById(id);
	if (!existeProducto) {
		throw new Error(`El producto con ese id no existe id: ${id}`);
	}
};

module.exports = {
	esRoleValido,
	emailExiste,
	existeUsuarioPorId,
	existeProductoPorId,
};
