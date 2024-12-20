const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('u420899308_BravoDatabase', 'u420899308_bravo', 'Ale90112326342*', {
	host: '82.197.82.96',
	dialect: 'mysql',
});

const dbConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log('🟢Conexión a la base de datos MySQL establecida con éxito.');
	} catch (error) {
		console.error('🔴Error al conectar a la base de datos:', error);
		throw new Error('🔴Error al iniciar la Base de Datos!');
	}
};

module.exports = {
	sequelize,
	dbConnection,
};
