<template>
	<div>
		<div class="col-12 d-flex">
			<div class="list-box" v-for="(list, index) in lists" :key="list.id">
				<div class="row">
					<div class="col-12">
						<div id="list-menu" class="d-flex">
							<b-input :id='"lista"+-+ list.id' :value='list.titulo' @blur="editarTitulo(edit, list.id)" :disabled="edit"></b-input>
							<b-button v-if="edit" class="list-button" @click="deletarLista(list.id)"><b-icon-trash></b-icon-trash></b-button>
						</div>
					</div>
					<div v-if="edit" class="col-12">
						<b-button id="list-aux" @click="moverEsquerda(list, list.id)"><b-icon-arrow-left></b-icon-arrow-left></b-button>
						<b-button id="list-aux" @click="moverDireita(list, list.id)"><b-icon-arrow-right></b-icon-arrow-right></b-button>
					</div>
				</div>
				<div class="row">
					<TaskCard :index="index" :editar="edit" :cards="list"/>
				</div>
			</div>
			<div v-if="this.$props.edit" class="list-box create">
				<b-input placeholder="Título da lista" @blur="criarCartao" v-model="cardText"></b-input>
			</div>
		</div>

	</div>
</template>

<script>
	import axios from 'axios'
	import TaskCard from './TaskCard.vue'

	export default {
		name: 'ListCard',
		props: ['lists', 'edit'],
		data() {
			return {
				cardText: '',
			}
		},
		methods: {
			criarCartao() {
				if (this.cardText == '') {
					return;
				}
				axios.post("http://localhost:3000/lista",
					{
						titulo: this.cardText,
						quadro_id: this.$route.params.id,
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
			editarTitulo(pode_editar, idLista) {
				if (!pode_editar || event.target.value == '') {
					return;
				}
				// console.log(event.target.value)


				axios.put('http://localhost:3000/lista/' + idLista, {
					titulo: event.target.value,
					quadro_id: this.$route.params.id,
				}, {
					headers:{'authorization': localStorage.getItem('token')}
				})

			},
			deletarLista(id) {
				// console.log(this.$props.lists)
				
				if (!id) {
					return;
				}
				axios.delete('http://localhost:3000/lista/' + id , {headers:{'authorization': localStorage.getItem('token')}})
				.then(() => {
					location.reload()
				})
			},
			moverEsquerda(list, listId) {
				if (this.$props.lists.indexOf(list) == 0) {
					return;
				}

				axios.put('http://localhost:3000/lista/' + listId + '/ordem', {ordem_lista: this.$props.lists.indexOf(list)}, {
					headers: {
						authorization: localStorage.getItem('token')
					}
				}).then(() => {
					location.reload()
				})
			},
			moverDireita(list, listId) {
				if ((this.$props.lists.indexOf(list) + 1) == this.$props.lists.length) {
					return;
				}

				axios.put('http://localhost:3000/lista/' + listId + '/ordem', {ordem_lista: this.$props.lists.indexOf(list) + 2}, {
					headers: {
						authorization: localStorage.getItem('token')
					}
				}).then(() => {
					location.reload()
				})
			},
		},
		components: {
			TaskCard
		},
	}
</script>