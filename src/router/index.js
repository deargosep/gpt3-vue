import Vue from 'vue'
import VueRouter from 'vue-router'
import GPT from '../views/GPT.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'GPT',
    component: GPT
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
