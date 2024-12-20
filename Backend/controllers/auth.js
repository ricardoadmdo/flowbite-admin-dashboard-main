const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');

// Función para iniciar sesión
const login = async (req, res) => {
	const { usuario, contrasena } = req.body;

	try {
		// Busca el usuario en la base de datos
		const user = await Usuario.findOne({ where: { usuario } });
		console.log('Usuario encontrado:', user);

		if (!user) {
			return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
		}

		// Compara la contraseña ingresada con la almacenada en la base de datos
		const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
		console.log('Contraseña coincide:', isMatch);

		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
		}

		// Si el usuario y la contraseña son correctos
		console.log('Inicio de sesión exitoso para usuario:', user);
		res.json({
			success: true,
			message: 'Inicio de sesión exitoso',
			nombre: user.nombre,
			rol: user.rol,
		});
	} catch (error) {
		console.error('Error en el inicio de sesión:', error);
		res.status(500).json({ success: false, message: 'Error en el servidor' });
	}
};

// Función para crear un usuario administrador
const createAdmin = async (req, res) => {
	const { usuario, contrasena, nombre, rol } = req.body;

	try {
		// Verifica si el usuario ya existe
		const existingUser = await Usuario.findOne({ where: { usuario } });

		if (existingUser) {
			return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
		}

		// Encripta la contraseña
		const hashedPassword = await bcryptjs.hash(contrasena, 10);

		// Crea el nuevo usuario
		const newUser = await Usuario.create({
			usuario,
			contrasena: hashedPassword,
			nombre,
			rol,
		});

		res.status(201).json({ success: true, message: 'Usuario administrador creado con éxito.' });
	} catch (error) {
		console.error('Error al crear el usuario administrador:', error);
		res.status(500).json({ success: false, message: 'Error al crear el usuario administrador.' });
	}
};

module.exports = { login, createAdmin };
