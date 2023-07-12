const mysql = require('mysql2');
const credentials = require('./credentials.js');

const pool = mysql
	.createPool({
		host: credentials.HOST,
		user: credentials.USER,
		password: credentials.PASSWORD,
		database: credentials.DATABASE,
		port: credentials.PORT,
		connectionLimit: credentials.CONNECTION_LIMIT, //important
		debug: credentials.DEBUG,
		waitForConnections: credentials.AWAIT_FOR_CONNECTIONS,
	})
	.promise();

async function connect() {
	try {
		const client = await pool.getConnection();

		return client;
	} catch (err) {
		console.error('Erro na conexão do cliente', err.stack);

		return undefined;
	}
}

function disconnect(client) {
	try {
		pool.releaseConnection(client);
	} catch (err) {
		console.error('Erro na desconexão do cliente', err.stack);
	}
}

module.exports = {
	connect,
	disconnect,
};
