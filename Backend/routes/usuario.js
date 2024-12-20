const { Router } = require('express');
const { createUsuario, getUsuarios, updateUsuario, deleteUsuario } = require('../controllers/usuario');

const router = Router();

// Crear un nuevo usuario
router.post('/', createUsuario);

// Obtener todos los usuarios
router.get('/', getUsuarios);

// Actualizar un usuario
router.put('/:id', updateUsuario);

// Eliminar un usuario
router.delete('/:id', deleteUsuario);

module.exports = router;
