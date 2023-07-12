const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const modelUser = require('../models/usuario.js');
const router = express.Router();
const credentials = require('../config/credentials.js');
const jsonwebtoken = require('jsonwebtoken');
const jose = require('jose');
const sgMail = require('@sendgrid/mail');
const { default: isEmail } = require('validator/lib/isEmail.js');

/*
 * Insere um usuario
 */
router.post('/', async function (req, res) {
	try {
		const nome = req?.body?.nome;
		const email = req?.body?.email;
		const senha = req?.body?.senha;
		let exist;
		let resultado;

		/**Validações */
		if (!isEmail(email) || !nome || !senha) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para criar o usuário!' });
		}
		exist = await modelUser.verificaEmail(email);

		if (!exist) {
			let hash = await bcrypt.hash(`${senha}`, 5);

			resultado = await modelUser.criaUsuario({
				nome: nome,
				email: email,
				senha: hash,
			});

			if (resultado)
				return res.status(201).json({ message: 'Usuário criado com sucesso!' });

			return res.status(500).json({ message: 'Falha ao criar o usuário!' });
		} else {
			return res.status(400).json({ message: 'E-mail já existe!' });
		}
	} catch {
		return res.status(500).json({ message: 'Falha ao criar o usuário!' });
	}
});

router.post('/login', async function (req, res) {
	try {
		/**Recupera as credenciais do usuário (senha vem criptografada por padrão, por segurança) */
		const [email, password] = base64
		.decode(req.headers.authorization.split(' ')[1])
		.split(':');
		
		let hash = await modelUser.buscaSenha(email);
		
		if (hash) {
			bcrypt.compare(password, hash, (err, result) => {
				/**Caso ocorra algum erro ao tentar comparar as senhas do formulário e do banco */
				if (err) {
					console.error('Erro ao autenticar usuário: ' + err);

					return res.status(500).json({ message: 'Erro interno do servidor' });
				}

				/**Caso a comparação tenha sido bem sucedida */
				if (result)
					return res.status(200).json({
						message: 'Usuário autenticado com sucesso',
						token: jsonwebtoken.sign(
							{ email: email, password: password },
							credentials.JWT_PRIVATE_KEY ?? '',
							{ expiresIn: '7 days' }
						),
						email: email,
					});
				else
					return res
						.status(401)
						.json({ message: 'Combinação e-mail/senha incorreta' });
			});
		} else return res.status(500).json({ message: 'Falha ao fazer login!1' });
	} catch {
		return res.status(500).json({ message: 'Falha ao fazer login!2' });
	}
});

router.post('/recuperacao', async function (req, res) {
	try {
		sgMail.setApiKey(credentials.API_KEY_SENDGRID);

		const email = req?.body?.email;

		const exist = await modelUser.verificaEmail(email);

		/**Validações */
		if (!isEmail(email)) {
			return res.status(400).json({
				message: 'Dados inválidos para envio de recuperação de senha!',
			});
		}

		if (exist) {
			const password = await modelUser.resetaSenha(email);

			if (password) {
				const msg = {
					to: email, // Change to your recipient
					from: 'web.trellog4@gmail.com', // Change to your verified sender
					subject: 'Recuperação de Senha - KanbanBoard',
					html: `<span>A sua nova senha é: ${password}</span><br><br>AVISO: Atualize para uma nova senha após efetuar o login no sistema.</span>`,
				};
				sgMail
					.send(msg)
					.then(() => {
						return res.status(200).json({
							message: 'Link de recuperação enviado para o seu e-mail!',
						});
					})
					.catch((error) => {
						console.error(error);
						return res
							.status(500)
							.json({ message: 'Falha ao enviar recuperação de senha!' });
					});
			} else
				return res
					.status(500)
					.json({ message: 'Falha ao enviar recuperação de senha!' });
		} else {
			return res
				.status(500)
				.json({ message: 'Falha ao enviar recuperação de senha!' });
		}
	} catch {
		return res
			.status(500)
			.json({ message: 'Falha ao enviar recuperação de senha!' });
	}
});

router.put('/', async function (req, res) {
	try {
		const token = req?.headers?.authorization;
		const password = req?.body?.senha;

		/**Validações */
		if (!token || !(password != undefined)) {
			return res
				.status(400)
				.json({ message: 'Dados inválidos para alteração de senha!' });
		}

		const hash = await bcrypt.hash(`${password}`, 5);

		let isChanged = await modelUser.alteraSenha(hash, token);

		if (isChanged)
			return res.status(200).json({ message: 'Senha alterada com sucesso!' });

		return res.status(500).json({ message: 'Falha ao alterar a senha!' });
	} catch {
		return res.status(500).json({ message: 'Falha ao alterar a senha!' });
	}
});

router.get('/token', async function (req, res) {
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

		if (email && exp > 0)
			return res.status(200).json({ message: 'O usuário está logado!' });

		throw new Error('erro');
	} catch {
		return res.status(400).json({ message: 'O token expirou!' });
	}
});

module.exports = router;
