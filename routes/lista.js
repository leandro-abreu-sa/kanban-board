const express = require('express');
const modelList = require('../models/lista.js');
const { default: isInt } = require('validator/lib/isInt.js');
const router = express.Router();

/*
 * Insere uma lista
 */
router.post('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;

		const title = req?.body?.titulo;
		const frameId = req?.body?.quadro_id;

		if (!token || !title || !isInt(String(frameId))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para criar a lista' });
		}

		const result = await modelList.criaLista(
			{
				titulo: title,
				quadro_id: frameId,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Lista criada com sucesso!' });

		return res.status(500).json({ message: 'Falha ao criar a lista' });
	} catch {
		return res.status(500).json({ message: 'Falha ao criar a lista' });
	}
});

/*
 * Altera uma lista
 */
router.put('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const title = req?.body?.titulo;

		if (!token || !title || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para alterar o título' });
		}

		const result = await modelList.alteraTitulo(
			{
				id: id,
				titulo: title,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Título alterado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao alterar o título' });
	} catch {
		return res.status(500).json({ message: 'Falha ao alterar o título' });
	}
});

/*
 * Remove uma lista
 */
router.delete('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para remover a lista' });
		}

		const result = await modelList.removeLista(id, token);

		if (result)
			return res.status(200).json({ message: 'Lista removida com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover a lista' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover a lista' });
	}
});

/*
 * Altera a ordem de uma lista
 */
router.put('/:id/ordem', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const listOrder = req?.body?.ordem_lista;

		if (!token || !isInt(String(id)) || !isInt(String(listOrder))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para alterar a ordem da lista' });
		}

		const result = await modelList.alteraOrdem(
			{
				id: id,
				ordem_lista: listOrder,
			},
			token
		);

		if (result)
			return res
				.status(200)
				.json({ message: 'Ordem da lista alterada com sucesso!' });

		return res
			.status(500)
			.json({ message: 'Falha ao alterar a ordem da lista' });
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao alterar a ordem da lista' });
	}
});

module.exports = router;
