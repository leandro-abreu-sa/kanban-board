const mysql = require('../config/database');
const credentials = require('../config/credentials');
const jose = require('jose');

async function criaCartao(cartao, token) {
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
			let sql2 = `SELECT utq.pode_editar as pode_editar
							FROM usuario_tem_quadro utq
							INNER JOIN lista l ON utq.quadro_id = l.quadro_id
							WHERE utq.usuario_id = ${id_usuario} AND
								l.id = ${cartao.lista_id}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let isEditable = result2[0]?.pode_editar;

			if (isEditable != undefined && isEditable != 0) {
				let sql3 = `INSERT INTO cartao (conteudo, data_criacao, data_atualizacao, lista_id)
							VALUES ('${cartao.conteudo}', now(), now(), ${cartao.lista_id})`;
				await client.query(sql3);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao criar o cartão', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function removeCartao(cartao_id, token) {
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
			let sql2 = `SELECT utq.pode_editar as pode_editar 
									FROM usuario_tem_quadro utq
									INNER JOIN lista l ON utq.quadro_id = l.quadro_id
									INNER JOIN cartao c ON l.id = c.lista_id
									WHERE utq.usuario_id = ${id_usuario} AND
										c.id = ${cartao_id}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let isEditable = result2[0]?.pode_editar;

			if (isEditable != undefined && isEditable != 0) {
				let sql3 = `DELETE FROM cartao
									WHERE id = ${cartao_id}`;
				await client.query(sql3);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao remover o cartão', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function transfereCartao(cartao_id, lista_id, token) {
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
			let sql2 = `SELECT utq.pode_editar as pode_editar,
								utq.quadro_id as quadro_id,
								l.id as lista_id
							FROM usuario_tem_quadro utq
							INNER JOIN lista l ON utq.quadro_id = l.quadro_id
							INNER JOIN cartao c ON l.id = c.lista_id
							WHERE utq.usuario_id = ${id_usuario} AND
								c.id = ${cartao_id}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let isEditable = result2[0]?.pode_editar;
			let frameId = result2[0]?.quadro_id;
			let listId = result2[0]?.lista_id;

			if (isEditable != undefined && isEditable != 0) {
				if (listId != lista_id) {
					let sql3 = `SELECT quadro_id
										FROM lista
										WHERE id = ${lista_id}`;
					let [result3, fields3] = await client.query(sql3);

					if (result3.length == 0) return false;

					let quadro_id = result3[0]?.quadro_id;

					if (frameId == quadro_id) {
						let sql4 = `UPDATE cartao
										SET lista_id = ${lista_id}, data_atualizacao = now()
										WHERE id = ${cartao_id}`;
						await client.query(sql4);

						return true;
					}

					return false;
				}

				return false;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao transferir o cartão', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function adicionaArquivo(arquivo, token) {
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
			let sql2 = `SELECT utq.pode_editar as pode_editar,
								utq.quadro_id as quadro_id,
								l.id as lista_id
							FROM usuario_tem_quadro utq
							INNER JOIN lista l ON utq.quadro_id = l.quadro_id
							INNER JOIN cartao c ON l.id = c.lista_id
							WHERE utq.usuario_id = ${id_usuario} AND
								c.id = ${arquivo.cartao_id}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let isEditable = result2[0]?.pode_editar;

			if (isEditable != undefined && isEditable != 0) {
				let sql3 = `INSERT INTO documento_pdf (url, cartao_id)
							VALUES ('${arquivo.url}', ${arquivo.cartao_id})`;
				await client.query(sql3);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao adicionar o arquivo PDF no cartão', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function buscaCartao(cartao_id, token) {
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
			let sql2 = `SELECT utq.pode_editar as pode_editar
									FROM usuario_tem_quadro utq
									INNER JOIN lista l ON utq.quadro_id = l.quadro_id
									INNER JOIN cartao c ON l.id = c.lista_id
									WHERE utq.usuario_id = ${id_usuario} AND
										c.id = ${cartao_id}`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let isEditable = result2[0]?.pode_editar;

			if (isEditable != undefined) {
				let sql3 = `SELECT *
									FROM cartao
									WHERE id = ${cartao_id}`;
				let [result3, fields3] = await client.query(sql3);

				if (result3.length == 0) return false;

				let json = {
					id: result3[0]?.id,
					conteudo: result3[0]?.conteudo,
					data_criacao: result3[0]?.data_criacao,
					data_atualizacao: result3[0]?.data_atualizacao,
					lista_id: result3[0]?.lista_id,
					files: [],
				};

				let sql4 = `SELECT *
									FROM documento_pdf
									WHERE cartao_id = ${cartao_id}`;
				let [result4, fields4] = await client.query(sql4);

				for (let document of result4) {
					json.files.push({
						id: document?.id,
						url: document?.url,
						cartao_id: document?.cartao_id,
					});
				}

				return json;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao buscar cartão', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

module.exports = {
	criaCartao,
	removeCartao,
	transfereCartao,
	adicionaArquivo,
	buscaCartao,
};
