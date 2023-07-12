<template>
	<div class="container">
		<div id="login-box">
			<div id="entrar">
				<div class="col-12">
					<h1>
						<!-- <span class="material-symbols-outlined">dashboard</span> -->
						<b-icon-kanban-fill></b-icon-kanban-fill>
						Kanboard
					</h1>
				</div>
				<div class="inputs">
					<form class="form-floating">
						<input id="user" class="form-control" type="email" v-model="email" placeholder="name@email.com.br">
						<label for="user">Username</label>
					</form>
					<form class="form-floating">
						<input id="password" class="form-control" type="password" v-model="senha" placeholder="Password">
							<label for="password">Password</label>
					</form>
					<button v-on:click="logar()">Entrar</button>
				</div>
				<div class="cadastro">
					<p>Ainda não é cadastrado ?</p>
					<p id="cadastrar" v-on:click="alterar()">cadastre-se!</p>
					<!-- <p id="cadastrar" v-on:click="recuperar()">Esqueceu a senha ?</p> -->
					<b-button id="forgot" v-b-modal.modal-prevent-closing>Esqueceu sua senha ?</b-button>
				</div>
			</div>
		</div>


		<b-modal
			id="modal-prevent-closing"
			ref="modal"
			title="Recuperar senha"
			@show="resetModal"
			@hidden="resetModal"
			@ok="handleSubmit"
		>
			<form ref="form" @submit.prevent="handleSubmit">
				<b-form-group
				label="Email"
				label-for="title-input"
				>
					<b-form-input
					id="emailR-input"
					v-model="emailRec"
					placeholder="name@email.com.br"
					></b-form-input>
				</b-form-group>
			</form>
		</b-modal>
	</div>
</template>

<script>
	import router from '../router'
	import axios from 'axios'
	

	export default {
		name: 'LoginPage',
		data() {
			return {
				email: '',
				senha: '',
				emailRec: '',
			}
		},
		methods: {
			// alterar() {
			// 	router.push({path: '/cadastro'});
			// },
			alterar() {
				router.push({path: '/cadastro'});
			},
			logar() {
				if (
					this.email != ''
					&& this.senha != ''
				) {
					axios.post("http://localhost:3000/usuario/login", {}, {
						auth: {
							username: this.email,
							password: this.senha
						}
					}).then((res) => {
						// console.log(res.data.token);
						localStorage.setItem('token', res.data.token);
						router.push({path: '/boards'});
					})
					.catch((error) => {
						console.log(error);
						localStorage.setItem('token', null);
					});
				}
			},
			resetModal() {
				this.emailRec = ''
			},
			handleSubmit() {
				// Exit when the form isn't valid
				if (
					this.emailRec == ''
				) {
					this.$nextTick(() => {
						console.log('Preencha todos os campos para criar o quadro.')
						this.$bvModal.hide('modal-prevent-closing')
						return
					})
				}

				axios.post("http://localhost:3000/usuario/recuperacao",
					{
						email: this.emailRec,
					}, {}
					).then(() => {
						location.reload()
					})
					.catch((error) => {
						console.log(error)
					}
				);
			},
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