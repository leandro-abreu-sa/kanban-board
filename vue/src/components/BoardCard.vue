<template>
	<b-card-group deck class="d-flex">
		<div v-for="(board) in boards" :key='board.id'>
			<b-card text-variant="red" v-bind:style="{backgroundColor: board.cor_fundo }" class="text-center">
				<a v-bind:style="{ color:board.cor_texto }" :href="'http://localhost:8080/board/' + board.id">
					<h2>{{ board.titulo }}</h2>
				</a>

				<b-button v-if="!board.favorito" @click="favoritar(board.id)"><b-icon-star></b-icon-star></b-button>
				<b-button v-if="board.favorito" @click="desFav(board.id)"><b-icon-star-fill></b-icon-star-fill></b-button>
				<b-button variant="danger" @click="apagar(board.id)"><b-icon-trash-fill></b-icon-trash-fill></b-button>
			</b-card>
		</div>
	</b-card-group>
</template>

<script>
	import axios from 'axios'


	export default {
		name: 'BoardCard',
		props: ['boards'],
		data() {
			return {
				title2: '',
				color2: '',
				tColor2: '',
			}
		},
		methods: {
			favoritar(id) {
				axios.put('http://localhost:3000/quadro/' + id + '/favorito', {}, {headers:{'authorization': localStorage.getItem('token')}})
				.then(() => {
					location.reload()
				})
			},
			desFav(id) {
				axios.delete('http://localhost:3000/quadro/' + id + '/favorito', {headers:{'authorization': localStorage.getItem('token')}})
				.then(() => {
					location.reload()
				})
			},
			apagar(id) {
				axios.delete('http://localhost:3000/quadro/' + id , {headers:{'authorization': localStorage.getItem('token')}})
				.then(() => {
					location.reload()
				})
			},
			handleSubmit2() {
				console.log('teste')
			},
			resetModal() {
				this.title = ''
			},
		},
		mounted() {
			console.log(this.$props.boards)
		}
	}
</script>