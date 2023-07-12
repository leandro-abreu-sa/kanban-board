<template>
	<div>
		<NavBar />
		<div class="d-flex">
			<h1>
				{{ this.titulo }}
			</h1>
			<b-button v-if="this.edit" v-b-modal.my-modal><b-icon-pencil-fill></b-icon-pencil-fill>
			</b-button>
			<b-button v-if="this.edit" v-b-modal.modal-share><b-icon-share-fill></b-icon-share-fill>
				Compartilhar
			</b-button>

			<b-modal title="Compartilhar quadro" id="modal-share" @ok="submitShare" @hidden="resetShare">
				<form>
					<b-form-group label="Email" label-for="email-input">
						<b-input id="email-input" placeholder="email do usuário" v-model="emailShare"></b-input>
					</b-form-group>
				
					<b-form-checkbox
						id="checkbox-1"
						v-model="editar"
						name="checkbox-1"
						value="true"
						unchecked-value="false"
					>
						Direito de edição
					</b-form-checkbox>
				</form>
			</b-modal>

			<b-modal 
				id="my-modal"
				@ok="submit"
			>
				<form ref="form" @submit.prevent="handleSubmit">
					<b-form-group
					label="Título"
					label-for="title-input"
					>
						<b-form-input
						id="title-input"
						v-model="novoT"
						placeholder="Novo Título"
						></b-form-input>
					</b-form-group>

					<b-form-group
					label="Cor de fundo"
					label-for="color-input"
					>
						<b-form-input
						id="color-input"
						v-model="corF"
						placeholder="black"
						></b-form-input>
					</b-form-group>

					<b-form-group
					label="Cor do Texto"
					label-for="t-color-input"
					>
						<b-form-input
						id="t-color-input"
						v-model="corT"
						placeholder="white"
						></b-form-input>
					</b-form-group>
				</form>
			</b-modal>
		</div>
		<div class="container d-flex">
			<ListCard :edit="this.edit" :lists="this.lists"/>
		</div>
	</div>
</template>

<script>
	import NavBar from './NavBar.vue'
	import ListCard from './ListCard.vue'
	import axios from 'axios'

	export default {
		name: 'BoardPage',
		data() {
			return {
				lists: [],
				titulo: '',
				novoT: '',
				corF: '',
				corT: '',
				edit: 0,
				editar: false,
				emailShare: '',
			}
		},
		methods: {
			submit() {
				if(
					this.novoT == ''
					|| this.corF == ''
					|| this.corT == ''
				) {
					console.log(' teste')
					return;
				}

				axios.put('http://localhost:3000/quadro/' + this.$route.params.id, {
					titulo: this.novoT,
					cor_fundo: this.corF,
					cor_texto: this.corT
				}, 
				{headers:{'authorization': localStorage.getItem('token')}}).then(location.reload());
			},
			submitShare () {
				if (this.emailShare == '') {
					this.resetShare()
					return;
				}

				axios.post('http://localhost:3000/quadro/' + this.$route.params.id + '/compartilhar', {
					email_compartilhado: this.emailShare,
					pode_editar: this.editar
				}, {headers:{'authorization': localStorage.getItem('token')}})
				console.log(this.editar)
			},
			resetShare () {
				this.emailShare = ''
				this.editar = false
			},
		},
		components: {
			NavBar,
			ListCard,
		},
		mounted() {
			axios.get('http://localhost:3000/quadro/' + this.$route.params.id, {headers:{'authorization': localStorage.getItem('token')}})
			.then(res => {
				this.lists.push(...res.data.listas)
				this.titulo = res.data.titulo
				this.novoT = res.data.titulo
				this.corF = res.data.cor_fundo
				this.corT = res.data.cor_texto
				this.edit = res.data.pode_editar
			})
			.catch((err) => {
				console.log(err)
				// location.reload()
			});
		}
	}
</script>

<style>
.container.d-flex {
	max-width: 100%;
	overflow-x: auto;
	height: 800px;
}
h1 {
	margin: 0px 10px 10px 50px;
}
.d-flex {
	margin-top: 10px;
}
</style>