<template>
	<div>
		<NavBar />
		
		<b-button id="add-board" v-b-modal.modal-prevent-closing><span class="material-symbols-outlined">add_box</span></b-button>

		<div class="container">
			<BoardCard :boards="this.boards"/>
		</div>

		<b-modal
			id="modal-prevent-closing"
			ref="modal"
			title="Novo quadro"
			@show="resetModal"
			@hidden="resetModal"
			@ok="handleOk"
		>
			<form ref="form" @submit.prevent="handleSubmit">
				<b-form-group
				label="Título"
				label-for="title-input"
				>
					<b-form-input
					id="title-input"
					v-model="title"
					placeholder="Novo Quadro"
					></b-form-input>
				</b-form-group>

				<b-form-group
				label="Cor de fundo"
				label-for="color-input"
				>
					<b-form-input
					id="color-input"
					v-model="color"
					placeholder="black"
					></b-form-input>
				</b-form-group>

				<b-form-group
				label="Cor do Texto"
				label-for="t-color-input"
				>
					<b-form-input
					id="t-color-input"
					v-model="tColor"
					placeholder="white"
					></b-form-input>
				</b-form-group>
			</form>
		</b-modal>
	</div>
</template>

<script>
	import NavBar from './NavBar.vue'
	import axios from 'axios'
	import BoardCard from './BoardCard.vue'

	export default {
		name: 'BoardsPage',
		data() {
			return {
				title: '',
				color: '',
				tColor: '',
				boards: []
			}
		},
		methods: {
			resetModal() {
				this.title = ''
				this.color = ''
				this.tColor = ''
			},
			handleOk(bvModalEvent) {
				// Prevent modal from closing
				bvModalEvent.preventDefault()
				// Trigger submit handler
				this.handleSubmit()
			},
			handleSubmit() {
				// Exit when the form isn't valid
				if (
					this.title == ''
					|| this.color == ''
					|| this.tColor == ''
				) {
					this.$nextTick(() => {
						console.log('Preencha todos os campos para criar o quadro.')
						this.$bvModal.hide('modal-prevent-closing')
						return
					})
				}

				axios.post("http://localhost:3000/quadro",
					{
						titulo: this.title,
						cor_fundo: this.color,
						cor_texto: this.tColor
					}, {
						headers: {
							authorization: localStorage.getItem('token')
						}
					}
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
			axios.get('http://localhost:3000/quadro', {headers:{'authorization': localStorage.getItem('token')}})
			.then(res => {
				this.boards.push(...res.data)
			})
			.catch((error) => {
				console.log(error);
			});
		},
		components: {
			NavBar,
			BoardCard
		}
	}
</script>