<template>
	<div>
		<div v-for="(card) in cards.cartoes" :key="card.id">
			<div class="task-box">
				<p id="card-text">{{card.conteudo}}</p>
				<!-- <b-input v-model="card.conteudo"></b-input> -->
				<p>Criado em:</p>
				<p>{{card.data_criacao}}</p>
				<p>Alterado em:</p>
				<p>{{card.data_atualizacao}}</p>
				<div id="button-row" b-row align-v="center">
					<b-button v-if="editar" @click="mudarE(card.id)"><b-icon-arrow-left></b-icon-arrow-left></b-button>
					<b-button v-if="editar" variant="danger" @click="deletar(card.id)"><b-icon-trash-fill></b-icon-trash-fill></b-button>
					<b-button v-if="editar" @click="mudarD(card.id)"><b-icon-arrow-right></b-icon-arrow-right></b-button>
				</div>
			</div>
		</div>
		<div class="row">
			<b-button v-if="editar" id="card-create" v-b-modal="'modal-card'+cards.id" > Criar Cartão </b-button>

			<b-modal title="Compartilhar quadro" :id="'modal-card'+cards.id" @ok="submitCard(cards.id)" @hidden="resetCard()">
				<form>
					<b-form-group label="Texto tarefa" label-for="card-input">
						<b-input id="card-input" placeholder="Texto tarefa" v-model="taskText"></b-input>
					</b-form-group>
				
				</form>
			</b-modal>


		</div>
	</div>
</template>

<script>
import axios from 'axios'

	export default {
		name: 'TaskCard',
		props: ['cards', 'index', 'editar'],
		data() {
			return {
				board: [],
				taskText: '',
			}
		},
		methods: {
			submitCard(id) {
				if (this.taskText == '') {
					this.resetCard()
					return
				}

				axios.post('http://localhost:3000/cartao', {
					conteudo: this.taskText,
					lista_id: id
				}, {headers:{'authorization': localStorage.getItem('token')}}).then(location.reload())
			},
			resetCard() {
				this.taskText = ''
			},
			mudarD(id) {
				let idLista = 0

				axios.get('http://localhost:3000/quadro/' + this.$route.params.id, {headers:{'authorization': localStorage.getItem('token')}})
				.then(res => {
					this.board.push(...res.data.listas)
					// eslint-disable-next-line
					if (!!this.board[this.$props.index + 1]) {
						idLista = this.board[this.$props.index + 1].id
					}
					
					axios.put('http://localhost:3000/cartao/' + id + '/transferir', {
						lista_id: idLista
					},{headers:{'authorization': localStorage.getItem('token')}}).then(location.reload())
				})
			},
			mudarE(id) {
				let idLista = 0

				axios.get('http://localhost:3000/quadro/' + this.$route.params.id, {headers:{'authorization': localStorage.getItem('token')}})
				.then(res => {
					this.board.push(...res.data.listas)
					// eslint-disable-next-line
					if (!!this.board[this.$props.index - 1]) {
						idLista = this.board[this.$props.index - 1].id
					}
					
					axios.put('http://localhost:3000/cartao/' + id + '/transferir', {
						lista_id: idLista
					},{headers:{'authorization': localStorage.getItem('token')}}).then(location.reload())
				})
			},
			deletar(id) {
				axios.delete('http://localhost:3000/cartao/' + id, {headers:{'authorization': localStorage.getItem('token')}}).then(location.reload())
			}
		},
		mounted() {
			// console.log(this.$props.cards.cartoes)
		}
	}
</script>

<style>
	.butao{
		height: 50px;	
	}
	#button-row {
		margin: 0 auto;
	}
	#card-text {
		line-break: anywhere;
	}
</style>