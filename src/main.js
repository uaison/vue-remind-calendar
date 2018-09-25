import Vue from 'vue'
import App from './App.vue'
import VueRemindCalendar from './lib/index'

Vue.use(VueRemindCalendar)

new Vue({
  el: '#app',
  render: h => h(App)
})
