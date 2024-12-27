const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./database/config.js');
require('dotenv').config();

//Crear el servidor de express
const app = express();

//Base de Datos
dbConnection();

//CORS
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://superbravo.es'];

app.use(
	cors({
		origin: function (origin, callback) {
			// allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	})
);

//Lectura y parseo del body asdasd asdasd
app.use(express.json());

//Rutas
// Usar las rutas de usuario
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/productos', require('./routes/producto'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/venta', require('./routes/venta'));
app.use('/api/gestor', require('./routes/gestor'));

//Escuchar peticiones.
app.listen(process.env.PORT, () => {
	console.log(`🟢Backend corriendo en el puerto: ${process.env.PORT}`);
});
