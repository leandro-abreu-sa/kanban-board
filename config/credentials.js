/**DATABASE */
const HOST = 'localhost';
const USER = 'root';
const PASSWORD = 'unirio';
const DATABASE = 'webtrello';
const PORT = '3306';
const CONNECTION_LIMIT = 100;
const DEBUG = false;
const AWAIT_FOR_CONNECTIONS = true;

/**CRIPTOGRAFIA */
const JWT_PRIVATE_KEY =
	'ba185134495830486aa8eaad2ff824aa6a1154d7290a2e193cbdfb0507b79ae360b1e57369f04a985f78372e246ed0890a4b5a261a498f2ab4d77b5e695c3120';

/**SENDGRID */
const API_KEY_SENDGRID =
	'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';

/**URL API */
const PUBLIC_BASEURL = 'http://localhost:3005';

module.exports = {
	HOST,
	USER,
	PASSWORD,
	DATABASE,
	PORT,
	CONNECTION_LIMIT,
	DEBUG,
	AWAIT_FOR_CONNECTIONS,
	JWT_PRIVATE_KEY,
	API_KEY_SENDGRID,
	PUBLIC_BASEURL,
};
