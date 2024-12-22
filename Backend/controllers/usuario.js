const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

const createUsuario = async (req, res) => {
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		// Verificar si el nombre de usuario ya existe
		const usuarioExistente = await Usuario.findOne({ usuario });
		if (usuarioExistente) {
			return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });
		}

		// Encriptar la contraseña
		const salt = bcryptjs.genSaltSync();
		const hashedPassword = bcryptjs.hashSync(contrasena, salt);

		const newUsuario = new Usuario({
			nombre,
			contrasena: hashedPassword,
			usuario,
			rol,
		});

		await newUsuario.save();
		res.status(201).json(newUsuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getUsuarios = async (req, res) => {
	try {
		const usuarios = await Usuario.find();
		res.status(200).json({ usuarios });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getUsuarioPorId = async (req, res) => {
	try {
		const usuario = await Usuario.findById(req.params.id);
		if (!usuario) {
			return res.status(404).json({ msg: 'Usuario no encontrado' });
		}
		res.json(usuario);
	} catch (error) {
		console.error('Error al obtener el usuario:', error);
		res.status(500).json({ msg: 'Error del servidor', error: error.message });
	}
};

const updateUsuario = async (req, res) => {
	const { id } = req.params;
	const { nombre, contrasena, usuario, rol } = req.body;

	try {
		// Buscar el usuario por su ID
		const usuarioExistente = await Usuario.findById(id);
		if (!usuarioExistente) {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		// Verificar si el nombre de usuario ya está en uso por otro usuario
		const usuarioDuplicado = await Usuario.findOne({ usuario, _id: { $ne: id } });
		if (usuarioDuplicado) {
			return res.status(400).json({ error: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
		}

		// Actualizar los campos solo si están presentes en el cuerpo de la solicitud
		usuarioExistente.nombre = nombre !== undefined ? nombre : usuarioExistente.nombre;
		if (contrasena !== undefined) {
			// Encriptar la nueva contraseña si se proporciona
			const salt = bcryptjs.genSaltSync();
			usuarioExistente.contrasena = bcryptjs.hashSync(contrasena, salt);
		}
		usuarioExistente.usuario = usuario !== undefined ? usuario : usuarioExistente.usuario;
		usuarioExistente.rol = rol !== undefined ? rol : usuarioExistente.rol;

		// Guardar los cambios
		await usuarioExistente.save();
		res.status(200).json(usuarioExistente);
	} catch (error) {
		// Capturar el error de MongoDB en caso de duplicado y devolver un mensaje claro
		if (error.code === 11000) {
			return res.status(400).json({ error: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
		}

		// En caso de otro tipo de error
		res.status(500).json({ error: error.message });
	}
};

const deleteUsuario = async (req, res) => {
	const { id } = req.params;

	try {
		const usuario = await Usuario.findById(id);
		if (usuario) {
			await usuario.deleteOne();
			res.status(200).json({ message: 'Usuario eliminado' });
		} else {
			res.status(404).json({ message: 'Usuario no encontrado' });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createUsuario,
	getUsuarios,
	updateUsuario,
	deleteUsuario,
	getUsuarioPorId,
};
