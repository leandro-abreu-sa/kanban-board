const express = require('express');
const modelFrame = require('../models/quadro.js');
const router = express.Router();
const { default: isInt } = require('validator/lib/isInt.js');
const { default: isEmail } = require('validator/lib/isEmail.js');
const { default: isBoolean } = require('validator/lib/isBoolean.js');

/*
 * Insere um quadro
 */
router.post('/', async function (req, res) {
	try {
		let titulo = req?.body?.titulo;
		let cor_fundo = req?.body?.cor_fundo;
		let cor_texto = req?.body?.cor_texto;
		const token = req?.headers?.authorization;

		if (!token || !titulo || !cor_fundo || !cor_texto) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para criar o quadro!' });
		}

		const result = await modelFrame.criaQuadro(
			{
				titulo: titulo,
				cor_fundo: cor_fundo,
				cor_texto: cor_texto,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Quadro criado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao criar o quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao criar o quadro' });
	}
});

/*
 * Altera um quadro
 */
router.put('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		let titulo = req?.body?.titulo;
		let cor_fundo = req?.body?.cor_fundo;
		let cor_texto = req?.body?.cor_texto;

		if (!token || !titulo || !cor_fundo || !cor_texto || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para alterar o quadro!' });
		}

		const result = await modelFrame.alteraQuadro(
			{
				id: id,
				titulo: titulo,
				cor_fundo: cor_fundo,
				cor_texto: cor_texto,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Quadro alterado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao alterar o quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao alterar o quadro' });
	}
});

/*
 * Altera flag favorito do quadro
 */
router.put('/:id/favorito', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;
		let favorito = true;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para adicionar como favorito!' });
		}

		const result = await modelFrame.alteraFavorito(id, favorito, token);

		if (result) {
			return res
				.status(200)
				.json({ message: 'Favorito adicionado com sucesso!' });
		}

		return res.status(500).json({ message: 'Falha ao adicionar favorito' });
	} catch {
		return res.status(500).json({ message: 'Falha ao adicionar favorito' });
	}
});

/*
 * Altera flag favorito do quadro
 */
router.delete('/:id/favorito', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;
		let favorito = false;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para remover o favorito!' });
		}

		const result = await modelFrame.alteraFavorito(id, favorito, token);

		if (result)
			return res
				.status(200)
				.json({ message: 'Favorito removido com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover favorito' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover favorito' });
	}
});

/*
 * Retorna quadros
 */
router.get('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;

		if (!token) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para retornar os quadros!' });
		}

		const result = await modelFrame.buscaQuadros(token);

		if (result) return res.status(200).json(result);

		return res.status(500).json({ message: 'Falha ao retornar os quadros' });
	} catch {
		return res.status(500).json({ message: 'Falha ao retornar os quadros' });
	}
});

/*
 * Retorna listas do quadro e seus cartões
 */
router.get('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para retornar o quadro!' });
		}

		const result = await modelFrame.buscaQuadro(id, token);

		if (result) return res.status(200).json(result);

		return res
			.status(500)
			.json({ message: 'Falha ao retornar dados do quadro' });
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao retornar dados do quadro' });
	}
});

/*
 * Remove o quadro
 */
router.delete('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para remover o quadro!' });
		}

		const result = await modelFrame.removeQuadro(id, token);

		if (result)
			return res.status(200).json({ message: 'Quadro removido com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover quadro' });
	}
});

/*
 * Compartilha o quadro
 */
router.post('/:id/compartilhar', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const sharedEmail = req?.body?.email_compartilhado;
		const isEditable = req?.body?.pode_editar;

		if (
			!token ||
			!isInt(String(id)) ||
			!isEmail(sharedEmail) ||
			!isBoolean(String(isEditable))
		) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para compartilhar o quadro!' });
		}

		const result = await modelFrame.compartilhaQuadro(
			id,
			sharedEmail,
			isEditable,
			token
		);

		if (result)
			return res
				.status(200)
				.json({ message: 'Quadro compartilhado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao compartilhar o quadro' });
	} catch {
		return res.status(500).json({ message: 'Falha ao compartilhar o quadro' });
	}
});

/*
 * Descompartilha o quadro
 */
router.delete('/:id/descompartilhar', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const sharedEmail = req?.body?.email_compartilhado;

		if (!token || !isInt(String(id)) || !isEmail(sharedEmail)) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para descompartilhar o quadro!' });
		}

		const result = await modelFrame.descompartilhaQuadro(
			id,
			sharedEmail,
			token
		);

		if (result)
			return res
				.status(200)
				.json({ message: 'Quadro descompartilhado com sucesso!' });

		return res
			.status(500)
			.json({ message: 'Falha ao descompartilhado o quadro' });
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao descompartilhado o quadro' });
	}
});

module.exports = router;
