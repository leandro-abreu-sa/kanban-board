import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import BoardsPage from '../components/BoardsPage.vue'
import BoardPage from '../components/BoardPage.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/login',
		name: 'login',
		component: LoginPage
	},
	{
		path: '/cadastro',
		name: 'register',
		component: RegisterPage
	},
	{
		path: '/boards',
		name: 'boards',
		component: BoardsPage
	},
	{
		path: '/board/:id',
		name: 'board',
		component: BoardPage
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

export default router
