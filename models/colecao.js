const mysql = require('../config/database');
const credentials = require('../config/credentials');
const jose = require('jose');

async function criaColecao(colecao, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		let id_usuario = result[0]?.id;

		if (id_usuario !== undefined) {
			let sql2 = `INSERT INTO colecao (titulo, usuario_id)
									VALUES ('${colecao.titulo}', ${id_usuario})`;
			await client.query(sql2);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao criar a coleção', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function buscaColecoes(token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		if (id_usuario !== undefined) {
			let sql2 = `SELECT * FROM colecao WHERE usuario_id = ${id_usuario}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			return result2;
		}

		return false;
	} catch (err) {
		console.error('Erro ao criar a coleção', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function removeColecao(colecao_id, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		let sql2 = `SELECT usuario_id
                        FROM colecao
                        WHERE id = ${colecao_id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let usuario_id = result2[0]?.usuario_id;

		if (id_usuario == usuario_id) {
			let sql3 = `DELETE FROM colecao
						WHERE id = ${colecao_id}`;
			await client.query(sql3);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao remover a coleção', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function adicionaQuadro(colecao_id, quadro_id, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		let sql2 = `SELECT utq.pode_editar as pode_editar
                        FROM usuario_tem_quadro utq
                        WHERE utq.usuario_id = ${id_usuario} AND
                            utq.quadro_id = ${quadro_id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;

		let sql3 = `SELECT usuario_id FROM colecao WHERE id = ${colecao_id}`;
		let [result3, fields3] = await client.query(sql3);

		if (result3.length == 0) return false;

		let usuario_id = result3[0]?.usuario_id;

		if (isEditable != undefined && id_usuario == usuario_id) {
			let sql4 = `UPDATE usuario_tem_quadro
                        SET colecao_id = ${colecao_id}
                        WHERE quadro_id = ${quadro_id}
                            AND usuario_id = ${usuario_id}`;
			await client.query(sql4);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao adicionar o quadro à coleção', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function removeQuadro(colecao_id, quadro_id, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		let sql2 = `SELECT utq.pode_editar as pode_editar,
                            utq.colecao_id as colecao_id
                        FROM usuario_tem_quadro utq
                        WHERE utq.usuario_id = ${id_usuario} AND
                            utq.quadro_id = ${quadro_id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;
		let idCollection = result2[0]?.colecao_id;

		if (idCollection == null || idCollection == undefined) return false;

		let sql3 = `SELECT usuario_id FROM colecao WHERE id = ${colecao_id}`;
		let [result3, fields3] = await client.query(sql3);

		if (result3.length == 0) return false;

		let usuario_id = result3[0]?.usuario_id;

		if (isEditable != undefined && id_usuario == usuario_id) {
			let sql4 = `UPDATE usuario_tem_quadro
                        SET colecao_id = null
                        WHERE quadro_id = ${quadro_id}
                            AND usuario_id = ${usuario_id}`;
			await client.query(sql4);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao remover o quadro da coleção', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

module.exports = {
	criaColecao,
	removeColecao,
	adicionaQuadro,
	removeQuadro,
	buscaColecoes,
};
