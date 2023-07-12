const mysql = require('../config/database');
const jose = require('jose');
const credentials = require('../config/credentials.js');
const generator = require('generate-password');
const bcrypt = require('bcrypt');

async function verificaEmail(email) {
	const client = await mysql.connect();

	try {
		let sql = `SELECT email FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql);

		if (result.length == 0) return false;

		return true;
	} catch (err) {
		console.error('Erro ao verificar e-mail', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function criaUsuario(usuario) {
	const client = await mysql.connect();

	try {
		let sql = `INSERT INTO usuario (nome, email, senha) 
                VALUES ('${usuario.nome}','${usuario.email}','${usuario.senha}')`;

		await client.query(sql);

		return true;
	} catch (err) {
		console.error('Erro ao criar usuário', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function alteraSenha(senha, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${email}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		let sql2 = `UPDATE usuario 
                SET senha = '${senha}'
				WHERE id = ${id_usuario}`;

		await client.query(sql2);

		return true;
	} catch (err) {
		console.error('Erro ao criar usuário', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function buscaSenha(email) {
	const client = await mysql.connect();

	try {
		let sql = `SELECT senha FROM usuario WHERE email = '${String(email)}'`;

		let [result, fields] = await client.query(sql);

		if (result.length == 0) return false;

		return result[0]?.senha;
	} catch (err) {
		console.error('Erro ao buscar senha', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function resetaSenha(email) {
	const client = await mysql.connect();

	try {
		let sql = `SELECT id FROM usuario WHERE email = '${String(email)}'`;

		let [result, fields] = await client.query(sql);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		let password = generator.generate({
			length: 15,
			numbers: true,
		});

		if (id_usuario && password) {
			const hash = await bcrypt.hash(`${password}`, 5);

			let sql2 = `UPDATE usuario
						SET senha = '${hash}'
						WHERE id = ${id_usuario}`;
			await client.query(sql2);

			return password;
		}

		return false;
	} catch (err) {
		console.error('Erro ao resetar senha', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

module.exports = {
	verificaEmail,
	criaUsuario,
	buscaSenha,
	alteraSenha,
	resetaSenha,
};
