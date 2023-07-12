<template>
	<div class="container">
		<div id="cadastro-box">
			<div id="entrar">
				<div class="col-12">
					<h1>
						<b-icon-kanban-fill></b-icon-kanban-fill>
						Cadastro
					</h1>
				</div>
				<form id="form-cadastro" @submit.prevent="handleSubmit">
					<label for="user">Nome</label>
					<input id="user" class="form-control" type="text" v-model="nome" placeholder="Jon Doe">
					
					<label for="email">Email</label>
					<input id="email" class="form-control" type="email" v-model="email" placeholder="name@email.com.br">
				
					<label for="password">Senha</label>
					<input id="password" class="form-control" type="password" v-model="senha" placeholder="Password">
					
					<label for="password2">Confirmar Senha</label>
					<input id="password2" class="form-control" type="password" v-model="confirmSenha" placeholder="Password">
					
					<button>Cadastrar</button>
				</form>
				<div class="cadastro">
					<p>Já é cadastrado ?</p>
					<p id="cadastrar" v-on:click="alterar()">Logue aqui!</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import router from '../router';
	import axios from 'axios'
	
	export default {
		name: 'RegisterPage',
		data() {
			return {
				nome: '',
				email: '',
				senha: '',
				confirmSenha: '',
			}
		},
		methods: {
			alterar() {
				router.push({path: '/login'});
			},
			handleSubmit() {
				if (
					this.nome != ''
					&& this.email != ''
					&& this.senha != ''
					&& this.confirmSenhasenha != ''
					&& (this.confirmSenha == this.senha)
				) {
					axios.post('http://localhost:3000/usuario', {
						nome: this.nome,
						email: this.email,
						senha: this.senha
					}).then(function (response) {
						if (response.status == 201) {
							router.push({path: '/login'});
						}
					})
					.catch(function () {
						location.reload();
					});
				}
			}
		},
		mounted() {
			if (localStorage.getItem('token')) {
				router.push({path: '/boards'});
			}
		}
	}
</script>

<style>
</style>