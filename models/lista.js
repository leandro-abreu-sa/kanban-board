const mysql = require('../config/database');
const credentials = require('../config/credentials');
const jose = require('jose');

async function criaLista(lista, token) {
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

		let sql2 = `SELECT pode_editar 
                        FROM usuario_tem_quadro 
                        WHERE usuario_id = ${id_usuario} AND
                            quadro_id = ${lista.quadro_id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;

		let sql3 = `SELECT max(ordem_lista) as ordem_lista
		FROM lista 
		WHERE quadro_id = ${lista.quadro_id}`;
		let [result3, fields3] = await client.query(sql3);

		if (result3.length == 0) return false;

		let listOrder;

		if (result3.length > 0 && result3[0]?.ordem_lista)
			listOrder = result3[0]?.ordem_lista + 1;
		else listOrder = 1;

		if (isEditable != undefined && isEditable != 0) {
			let sql4 = `INSERT INTO lista (titulo, quadro_id, ordem_lista)
                        VALUES ('${lista.titulo}', ${lista.quadro_id}, ${listOrder})`;
			await client.query(sql4);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao criar lista', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function alteraTitulo(lista, token) {
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
						INNER JOIN lista l ON utq.quadro_id = l.quadro_id
                        WHERE utq.usuario_id = ${id_usuario} AND
                            l.id = ${lista.id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;

		if (isEditable != undefined && isEditable != 0) {
			let sql3 = `UPDATE lista
						SET titulo = '${lista.titulo}'
						WHERE id = ${lista.id}`;
			await client.query(sql3);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao alterar título', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function removeLista(lista_id, token) {
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
						INNER JOIN lista l ON utq.quadro_id = l.quadro_id
                        WHERE utq.usuario_id = ${id_usuario} AND
                            l.id = ${lista_id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;

		if (isEditable != undefined && isEditable != 0) {
			let sql3 = `DELETE FROM lista
						WHERE id = ${lista_id}`;
			await client.query(sql3);

			return true;
		}

		return false;
	} catch (err) {
		console.error('Erro ao remover lista', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

async function alteraOrdem(lista, token) {
	const client = await mysql.connect();

	try {
		let [result00, fields00] = await client.query(`SELECT quadro_id
		FROM lista
		WHERE id = ${lista.id}`);

		if (result00.length == 0) return false;

		let id_quadro = result00[0]?.quadro_id;

		let sql0 = `SELECT count(*) as qtd_lista
					FROM lista
					WHERE quadro_id = ${id_quadro}`;
		let [result0, fields0] = await client.query(sql0);

		if (result0.length == 0) return false;

		let qtd_lista = result0[0]?.qtd_lista;

		if (qtd_lista == 0 || lista.ordem_lista > qtd_lista) return false;

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
						   utq.quadro_id as quadro_id,
						   l.ordem_lista as ordem_lista
                        FROM usuario_tem_quadro utq
						INNER JOIN lista l ON utq.quadro_id = l.quadro_id
                        WHERE utq.usuario_id = ${id_usuario} AND
                            l.id = ${lista.id}`;
		let [result2, fields2] = await client.query(sql2);

		if (result2.length == 0) return false;

		let isEditable = result2[0]?.pode_editar;
		let quadro_id = result2[0]?.quadro_id;
		let ordem_lista = result2[0]?.ordem_lista;

		if (isEditable != undefined && isEditable != 0) {
			if (ordem_lista != lista.ordem_lista) {
				if (ordem_lista < lista.ordem_lista) {
					let sql3 = `UPDATE lista
								SET ordem_lista = ordem_lista - 1
								WHERE quadro_id = ${quadro_id}
								AND (ordem_lista <= ${lista.ordem_lista} AND ordem_lista > ${ordem_lista})`;
					await client.query(sql3);

					let sql4 = `UPDATE lista
								SET ordem_lista = ${lista.ordem_lista}
								WHERE quadro_id = ${quadro_id} AND id = ${lista.id}`;
					await client.query(sql4);
				} else {
					let sql3 = `UPDATE lista
					SET ordem_lista = ordem_lista + 1
					WHERE quadro_id = ${quadro_id}
					AND (ordem_lista >= ${lista.ordem_lista} AND ordem_lista < ${ordem_lista})`;
					await client.query(sql3);

					let sql4 = `UPDATE lista
								SET ordem_lista = ${lista.ordem_lista}
								WHERE quadro_id = ${quadro_id} AND id = ${lista.id}`;
					await client.query(sql4);
				}

				return true;
			}
			return false;
		}

		return false;
	} catch (err) {
		console.error('Erro ao alterar ordem da lista', err);
		return false;
	} finally {
		mysql.disconnect(client);
	}
}

module.exports = {
	criaLista,
	alteraTitulo,
	removeLista,
	alteraOrdem,
};
