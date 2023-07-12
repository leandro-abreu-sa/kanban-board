const express = require('express');
const modelCard = require('../models/cartao.js');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const index = require('../index.js');
const auxFunctions = require('../helpers/auxFunctions.js');
const { default: isInt } = require('validator/lib/isInt.js');

/*
 * Insere um cartão
 */
router.post('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;

		const content = req?.body?.conteudo;
		const listId = req?.body?.lista_id;

		if (!token || !content || !isInt(String(listId))) {
			return res.status(400).json({
				message: 'Dados inválidos para adicionar um cartão na lista',
			});
		}

		const result = await modelCard.criaCartao(
			{
				conteudo: content,
				lista_id: listId,
			},
			token
		);

		if (result)
			return res.status(200).json({ message: 'Cartão criado com sucesso!' });

		return res.status(500).json({ message: 'Falha ao criar o cartão' });
	} catch {
		return res.status(500).json({ message: 'Falha ao criar o cartão' });
	}
});

/*
 * Retorna um cartão
 */
router.get('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res.status(400).json({
				message: 'Dados inválidos para adicionar um cartão na lista',
			});
		}

		const result = await modelCard.buscaCartao(id, token);

		if (result) return res.status(200).json(result);

		return res
			.status(500)
			.json({ message: 'Falha ao retornar dados do cartão' });
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao retornar dados do cartão' });
	}
});

/*
 * Transfere um cartão
 */
router.put('/:id/transferir', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const listId = req?.body?.lista_id;

		if (!token || !isInt(String(id)) || !isInt(String(listId))) {
			return res.status(400).json({
				message: 'Dados inválidos para transferir um cartão para outra lista',
			});
		}

		const result = await modelCard.transfereCartao(id, listId, token);

		if (result)
			return res
				.status(200)
				.json({ message: 'Cartão transferido com sucesso!' });

		return res.status(500).json({ message: 'Falha ao transferir o cartão' });
	} catch {
		return res.status(500).json({ message: 'Falha ao transferir o cartão' });
	}
});

/*
 * Remove um cartão
 */
router.delete('/:id', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		if (!token || !isInt(String(id))) {
			return res.status(400).json({
				message: 'Dados inválidos para remover um cartão da lista',
			});
		}

		const result = await modelCard.removeCartao(id, token);

		if (result)
			return res.status(200).json({ message: 'Cartão removido com sucesso!' });

		return res.status(500).json({ message: 'Falha ao remover o cartão' });
	} catch {
		return res.status(500).json({ message: 'Falha ao remover o cartão' });
	}
});

/*
 * Carrega um arquivo no cartão
 */
router.post('/:id/upload', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const id = req?.params?.id;

		const form = formidable.IncomingForm();
		const uploadFolder = index.uploadFolder;

		if (!token || !isInt(String(id)) || !form) {
			return res.status(400).json({
				message: 'Dados inválidos para adicionar um arquivo PDF no cartão',
			});
		}

		form.multiples = true;
		form.maxFileSize = 50 * 1024 * 1024;
		form.uploadDir = uploadFolder;

		form.parse(req, async function (err, fields, files) {
			if (err) {
				console.error('Erro ao carregar o arquivo');
				return res.status(500).json({ message: 'Falha ao carregar o arquivo' });
			}

			if (!files.myFile.length) {
				const file = files.myFile;

				const isValid = auxFunctions.isFileValid(file);

				const fileName = encodeURIComponent(file.name.replace(/\s/g, '-'));

				if (!isValid) {
					console.error('Erro ao carregar o arquivo');
					return res.status(400).json({
						message:
							'Falha ao carregar o arquivo: o arquivo deve ser do tipo PDF',
					});
				}

				try {
					fs.renameSync(file.path, path.join(uploadFolder, fileName));
				} catch (error) {
					console.error(error);
					return res.status(500).json({
						message: 'Falha ao carregar o arquivo',
					});
				}
				const result = await modelCard.adicionaArquivo(
					{
						url: path.join(uploadFolder, fileName),
						cartao_id: id,
					},
					token
				);

				if (result) {
					return res
						.status(200)
						.json({ message: 'Arquivo carregado com sucesso!' });
				} else {
					return res
						.status(500)
						.json({ message: 'Falha ao carregar o arquivo' });
				}
			} else {
				return res.status(400).json({
					message: 'Apenas 1 arquivo deve ser carregado por vez',
				});
			}
		});
	} catch {
		return res.status(500).json({ message: 'Falha ao carregar o arquivo' });
	}
});

module.exports = router;
