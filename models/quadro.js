const mysql = require('../config/database');
const credentials = require('../config/credentials');
const jose = require('jose');

async function alteraFavorito(quadro_id, favorito, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result, fields] = await client.query(sql);

		if (result.length == 0) return false;

		let id_usuario = result[0]?.id;

		if (favorito) favorito = 1;
		else favorito = 0;

		let sql2 = `SELECT id 
					FROM usuario_tem_quadro 
					WHERE quadro_id = ${quadro_id}
					AND usuario_id = ${id_usuario}`;
		let [result2, fields2] = await client.query(sql2);

		let idUserHasFrame = result2[0]?.id;

		if (idUserHasFrame !== undefined) {
			let sql3 = `UPDATE usuario_tem_quadro
                SET favorito = ${favorito}
                WHERE quadro_id = ${quadro_id} AND
					usuario_id = ${id_usuario}`;
			await client.query(sql3);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao alterar favorito', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function criaQuadro(quadro, token) {
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

		let sql2 = `INSERT INTO quadro (titulo, cor_fundo, cor_texto, usuario_id)
                    VALUES ('${quadro.titulo}', '${quadro.cor_fundo}', '${quadro.cor_texto}', ${id_usuario})`;

		await client.query(sql2);

		let sql3 = `SELECT LAST_INSERT_ID() as id FROM usuario WHERE email = '${String(
			email
		)}'`;
		let [result2, fields2] = await client.query(sql3);

		if (result2.length == 0) return false;

		let id_quadro = result2[0]?.id;

		let sql4 = `INSERT INTO usuario_tem_quadro (pode_editar, favorito, colecao_id, usuario_id, quadro_id)
                    VALUES (1, 0, NULL, ${id_usuario}, ${id_quadro})`;

		await client.query(sql4);

		return true;
	} catch (err) {
		console.error('Erro ao criar quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function compartilhaQuadro(
	quadro_id,
	email_compartilhado,
	pode_editar,
	token
) {
	const client = await mysql.connect();

	try {
		let sql1 = `SELECT usuario_id 
			FROM quadro
			WHERE id = ${quadro_id}`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let usuario_id = result[0]?.usuario_id;

		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql2 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let id_usuario = result2[0]?.id;

		if (usuario_id == id_usuario) {
			let sql3 = `SELECT id FROM usuario WHERE email = '${String(
				email_compartilhado
			)}'`;
			let [result3, fields3] = await client.query(sql3);

			if (result3.length == 0) return false;

			let sharedUserId = result3[0]?.id;

			let sql0 = `SELECT *
						FROM usuario_tem_quadro 
						WHERE usuario_id = ${sharedUserId}
							AND quadro_id = ${quadro_id}`;
			let [result0, fields0] = await client.query(sql0);

			if (result0.length > 0) return false;

			if (sharedUserId !== undefined) {
				if (pode_editar) pode_editar = 1;
				else pode_editar = 0;

				let sql4 = `INSERT INTO usuario_tem_quadro (pode_editar, favorito, colecao_id, usuario_id, quadro_id)
										VALUES (${pode_editar}, 0, NULL, ${sharedUserId}, ${quadro_id})`;

				await client.query(sql4);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao compartilhar quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function descompartilhaQuadro(quadro_id, email_compartilhado, token) {
	const client = await mysql.connect();

	try {
		let sql1 = `SELECT usuario_id 
			FROM quadro
			WHERE id = ${quadro_id}`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let usuario_id = result[0]?.usuario_id;

		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql2 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let id_usuario = result2[0]?.id;

		if (usuario_id == id_usuario) {
			let sql3 = `SELECT id FROM usuario WHERE email = '${String(
				email_compartilhado
			)}'`;
			let [result3, fields3] = await client.query(sql3);

			if (result3.length == 0) return false;

			let sharedUserId = result3[0]?.id;

			let sql0 = `SELECT *
						FROM usuario_tem_quadro 
						WHERE usuario_id = ${sharedUserId}
							AND quadro_id = ${quadro_id}`;
			let [result0, fields0] = await client.query(sql0);

			if (result0.length == 0) return false;

			if (sharedUserId !== undefined) {
				let sql4 = `DELETE FROM usuario_tem_quadro
								WHERE quadro_id = ${quadro_id}
									AND usuario_id = ${sharedUserId}`;

				await client.query(sql4);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao compartilhar quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function buscaQuadros(token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT q.id as id,
                            q.titulo as titulo, 
                            q.cor_fundo as cor_fundo,
                            q.cor_texto as cor_texto,
                            utq.usuario_id as usuario_id,
                            utq.pode_editar as pode_editar,
                            utq.favorito as favorito,
                            utq.colecao_id as colecao_id
                    FROM usuario_tem_quadro utq 
                    INNER JOIN usuario u ON utq.usuario_id = u.id
					INNER JOIN quadro q ON utq.quadro_id = q.id
                    WHERE u.email = '${String(email)}'`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		return result;
	} catch (err) {
		console.error('Erro ao buscar quadros', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function removeQuadro(id_quadro, token) {
	const client = await mysql.connect();

	try {
		let sql1 = `SELECT usuario_id FROM quadro WHERE id = ${id_quadro}`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let usuario_id = result[0]?.usuario_id;

		if (usuario_id) {
			const {
				payload: { email },
			} = await jose.jwtVerify(
				token,
				new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
			);

			let sql2 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
			let [result2, fields] = await client.query(sql2);

			if (result2.length == 0) return false;

			let id_usuario = result2[0]?.id;

			if (usuario_id == id_usuario) {
				let sql3 = `DELETE 
                        FROM usuario_tem_quadro
                        WHERE quadro_id = ${id_quadro}`;
				await client.query(sql3);

				let sql4 = `DELETE 
                        FROM quadro
                        WHERE id = ${id_quadro}`;
				await client.query(sql4);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao remover quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function alteraQuadro(quadro, token) {
	const client = await mysql.connect();

	try {
		let sql1 = `SELECT usuario_id, pode_editar FROM usuario_tem_quadro WHERE quadro_id = ${quadro.id}`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let usuario_id = result[0]?.usuario_id;
		let isEditable = result[0]?.pode_editar;

		if (usuario_id && isEditable != 0) {
			const {
				payload: { email },
			} = await jose.jwtVerify(
				token,
				new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
			);

			let sql2 = `SELECT id FROM usuario WHERE email = '${String(email)}'`;
			let [result2, fields2] = await client.query(sql2);

			if (result2.length == 0) return false;

			let id_usuario = result2[0]?.id;

			if (usuario_id == id_usuario) {
				let sql1 = `UPDATE quadro
                SET titulo = '${quadro.titulo}', cor_fundo = '${quadro.cor_fundo}', cor_texto = '${quadro.cor_texto}'
                WHERE id = ${quadro.id}`;
				await client.query(sql1);

				return true;
			}

			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao alterar quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function buscaQuadro(quadro_id, token) {
	const client = await mysql.connect();

	try {
		const {
			payload: { email },
		} = await jose.jwtVerify(
			token,
			new TextEncoder().encode(credentials.JWT_PRIVATE_KEY ?? '')
		);

		let sql1 = `SELECT q.id as id,
							q.titulo as titulo,
							q.cor_fundo as cor_fundo,
							q.cor_texto as cor_texto,
							utq.usuario_id as usuario_id,
							utq.pode_editar as pode_editar,
							utq.favorito as favorito,
							utq.colecao_id as colecao_id
                    FROM quadro q 
					INNER JOIN usuario_tem_quadro utq ON q.id = utq.quadro_id
                    INNER JOIN usuario u ON utq.usuario_id = u.id
                    WHERE u.email = '${String(email)}'
                    AND q.id = ${quadro_id}`;
		let [result, fields] = await client.query(sql1);

		if (result.length == 0) return false;

		let sql2 = `SELECT *
                    FROM lista 
                    WHERE quadro_id = ${quadro_id}
					ORDER BY ordem_lista`;
		let [result2, fields2] = await client.query(sql2);

		let json = {
			id: result[0].id,
			titulo: result[0].titulo,
			cor_fundo: result[0].cor_fundo,
			cor_texto: result[0].cor_texto,
			usuario_id: result[0].usuario_id,
			pode_editar: result[0].pode_editar,
			favorito: result[0].favorito,
			colecao_id: result[0].colecao_id,
			listas: [],
		};

		let lists = [];

		for (let list of result2) {
			let obj = {
				id: list.id,
				titulo: list.titulo,
				quadro_id: list.quadro_id,
				cartoes: [],
			};

			let sql3 = `SELECT *
                    FROM cartao
                    WHERE lista_id = ${list.id}`;
			let [result3, fields3] = await client.query(sql3);

			let cards = [];

			for (let card of result3) {
				let documents = [];

				let sql4 = `SELECT *
				FROM documento_pdf
				WHERE cartao_id = ${card.id}`;
				let [result4, fields4] = await client.query(sql4);

				for (let document of result4) {
					documents.push({
						id: document.id,
						url: document.url,
						cartao_id: document.cartao_id,
					});
				}

				let json_card = {
					id: card.id,
					conteudo: card.conteudo,
					data_criacao: card.data_criacao,
					data_atualizacao: card.data_atualizacao,
					lista_id: card.lista_id,
					documentos_pdf: documents,
				};

				// json_card.data_atualizacao = `${json_card.data_atualizacao.getDate()}/${
				// 	json_card.data_atualizacao.getMonth() + 1
				// }/${json_card.data_atualizacao.getFullYear()} ${json_card.data_atualizacao.getHours()}:${json_card.data_atualizacao.getMinutes()}:${json_card.data_atualizacao.getSeconds()}
				// `;
				// json_card.data_criacao = `${json_card.data_criacao.getDate()}/${
				// 	json_card.data_criacao.getMonth() + 1
				// }/${json_card.data_criacao.getFullYear()} ${json_card.data_criacao.getHours()}:${json_card.data_criacao.getMinutes()}:${json_card.data_criacao.getSeconds()}
				// `;

				json_card.data_atualizacao = String(
					json_card.data_atualizacao.toLocaleString('pt-BR')
				);
				json_card.data_criacao = String(
					json_card.data_criacao.toLocaleString('pt-BR')
				);

				cards.push(json_card);
			}

			obj.cartoes = cards;
			lists.push(obj);
		}

		json.listas = lists;

		return json;
	} catch (err) {
		console.error('Erro ao buscar quadro', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

module.exports = {
	criaQuadro,
	buscaQuadros,
	removeQuadro,
	alteraQuadro,
	buscaQuadro,
	alteraFavorito,
	compartilhaQuadro,
	descompartilhaQuadro,
};
