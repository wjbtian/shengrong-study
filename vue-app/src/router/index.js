import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DiaryView from '../views/DiaryView.vue'
import ChineseView from '../views/ChineseView.vue'
import MathView from '../views/MathView.vue'
import EnglishView from '../views/EnglishView.vue'
import OlympiadView from '../views/OlympiadView.vue'
import TechView from '../views/TechView.vue'
import GuitarView from '../views/GuitarView.vue'
import ShinesView from '../views/ShinesView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/diary', name: 'diary', component: DiaryView },
  { path: '/chinese', name: 'chinese', component: ChineseView },
  { path: '/math', name: 'math', component: MathView },
  { path: '/english', name: 'english', component: EnglishView },
  { path: '/olympiad', name: 'olympiad', component: OlympiadView },
  { path: '/tech', name: 'tech', component: TechView },
  { path: '/guitar', name: 'guitar', component: GuitarView },
  { path: '/shines', name: 'shines', component: ShinesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
