<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import router from './router';

export default {
	name: 'App',
	components: {
	},
	mounted () {
		if (
			!localStorage.getItem('token')
			&& this.$router.history.current.path != '/login'
			&& this.$router.history.current.path != '/cadastro'
		) {
			router.push({path: '/login'});
			return;
		}

		// router.push({path: '/boards'});
	}
}
</script>

<style>
	@import './assets/style.css';
</style>