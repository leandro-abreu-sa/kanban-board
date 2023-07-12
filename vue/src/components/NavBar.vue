<template>
	<nav class="navbar navbar-expand-lg ">
		<a class="nav-link brand" href="/login">
			<!-- <span class="material-symbols-outlined">dashboard</span> -->
			<b-icon-kanban-fill></b-icon-kanban-fill>
			Kanboard
		</a>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item">
					<a class="nav-link" href="/boards">Boards</a>
				</li>
				<li class="nav-item">
					<a id="deslogar" class="nav-link" v-on:click="deslogar()">Deslogar</a>
				</li>
				<li class="nav-item">
					<b-button id="recuperar" v-b-modal.modal-alter>Trocar Senha</b-button>
				</li>
			</ul>
		</div>

		<b-modal
			id="modal-alter"
			ref="modal"
			title="Alterar Senha"
			@show="resetModal"
			@hidden="resetModal"
			@ok="handleSubmit"
		>
			<form ref="form" @submit.prevent="handleSubmit">
				<b-form-group
				label="Nova Senha"
				label-for="title-input"
				>
					<b-form-input
					id="title-input"
					v-model="novaSenha"
					placeholder="***"
					></b-form-input>
				</b-form-group>
			</form>
		</b-modal>
	</nav>

</template>

<script>
	import axios from 'axios'

	export default {
		name: 'NavBar',
		data() {
			return {
				novaSenha: ''
			}
		},
		methods: {
			deslogar() {
				localStorage.removeItem('token');
				location.reload();
			},
			resetModal() {
				this.novaSenha = ''
			},
			handleSubmit() {
				// Exit when the form isn't valid
				if (this.novaSenha == '') {
					return
				}

				axios.put('http://localhost:3000/usuario', {
					senha: this.novaSenha
				},
				{
					headers:{'authorization': localStorage.getItem('token')}
				})
			},
		}
	}
</script>

<style>
	.material-symbols-outlined {
		font-variation-settings:
		'FILL' 1,
		'wght' 400,
		'GRAD' 0,
		'opsz' 48
	}
</style>