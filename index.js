const express = require('express');
const app = express();
const routes = require('./routes.js');
const path = require('path');
const jose = require('jose');
const credentials = require('./config/credentials');

const cors = require('cors');
app.use(cors({ origin: '*' }));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadFolder = path.join(__dirname, 'public', 'files');

app.use('/usuario', routes.usuario);
/*
 *	Middleware para todas as rotas, exceto para /usuario
 */
app.use(async function (req, res, next) {
	try {
		const token = req?.headers?.authorization;

		if (token == undefined)
			return res.status(400).json({ message: 'O usuário não está logado!' });

		const {
			payload: { email, exp },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		if (email && exp > 0) return next();

		throw new Error('erro');
	} catch {
		return res.status(400).json({ message: 'O token expirou!' });
	}
});

app.use('/quadro', routes.quadro);
app.use('/lista', routes.lista);
app.use('/cartao', routes.cartao);
app.use('/colecao', routes.colecao);

app.listen(3000);

module.exports = {
	uploadFolder,
};
