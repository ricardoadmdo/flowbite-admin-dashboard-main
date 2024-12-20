const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		// Encriptar la contraseña
		const salt = bcryptjs.genSaltSync();
		const hashedPassword = bcryptjs.hashSync(contrasena, salt);

		const newUsuario = await Usuario.create({
			nombre,
			contrasena: hashedPassword,
			usuario,
			rol,
		});

		res.status(201).json(newUsuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.findAll();
		res.status(200).json({ usuarios });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Actualizar un usuario
const updateUsuario = async (req, res) => {
	const { id } = req.params;
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		const user = await Usuario.findByPk(id);
		if (!user) {
			return res.status(404).json({ msg: 'Usuario no encontrado' });
		}

		// Encriptar la nueva contraseña si se proporciona
		if (contrasena) {
			const salt = bcryptjs.genSaltSync();
			user.contrasena = bcryptjs.hashSync(contrasena, salt);
		}

		user.nombre = nombre || user.nombre;
		user.usuario = usuario || user.usuario;
		user.rol = rol || user.rol;

		await user.save();
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
	const { id } = req.params;

	try {
		const user = await Usuario.findByPk(id);
		if (!user) {
			return res.status(404).json({ msg: 'Usuario no encontrado' });
		}

		await user.destroy();
		res.status(200).json({ msg: 'Usuario eliminado' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createUsuario,
	getUsuarios,
	updateUsuario,
	deleteUsuario,
};
