const express = require('express');
const modelCollection = require('../models/colecao.js');
const { default: isInt } = require('validator/lib/isInt.js');
const router = express.Router();

/*
 * Cria uma coleção
 */
router.post('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;

		const title = req?.body?.titulo;

		if (!token || !title) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para criar a coleção' });
		}

		const result = await modelCollection.criaColecao(
			{
				titulo: title,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Coleção criada com sucesso!' });

		return res.status(500).json({ message: 'Falha ao criar a coleção' });
	} catch {
		return res.status(500).json({ message: 'Falha ao criar a coleção' });
	}
});

/*
 * Retorna as coleções do usuário
 */
router.get('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;

		if (!token) {
			return res.status(400).json({
				message: 'Dados inválidos para retornar as coleções do usuário',
			});
		}

		const result = await modelCollection.buscaColecoes(token);

		if (result) return res.status(200).json(result);

		return res
			.status(500)
			.json({ message: 'Falha ao retornar as coleções do usuário' });
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao retornar as coleções do usuário' });
	}
});

/*
 * Remove uma coleção
 */
router.delete('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para remover a coleção' });
		}

		const result = await modelCollection.removeColecao(id, token);

		if (result)
			return res.status(200).json({ message: 'Coleção removida com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover a coleção' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover a coleção' });
	}
});

/*
 * Adiciona um quadro a uma coleção
 */
router.post('/:id/quadro/:quadro_id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;
		const frameId = req?.params?.quadro_id;

		if (!token || !isInt(String(id)) || !isInt(String(frameId))) {
			return res.status(400).json({
				message: 'Dados inválidos para adicionar um quadro à coleção',
			});
		}

		const result = await modelCollection.adicionaQuadro(id, frameId, token);

		if (result)
			return res
				.status(200)
				.json({ message: 'Quadro adicionado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao adicionar o quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao adicionar o quadro' });
	}
});

/*
 * Remove um quadro
 */
router.delete('/:id/quadro/:quadro_id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;
		const frameId = req?.params?.quadro_id;

		if (!token || !isInt(String(id)) || !isInt(String(frameId))) {
			return res.status(400).json({
				message: 'Dados inválidos para remover um quadro da coleção',
			});
		}

		const result = await modelCollection.removeQuadro(id, frameId, token);

		if (result)
			return res.status(200).json({ message: 'Quadro removido com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover o quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover o quadro' });
	}
});

module.exports = router;
