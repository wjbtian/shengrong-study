import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DiaryView from '../views/DiaryView.vue'
import ChineseView from '../views/study/ChineseView.vue'
import MathView from '../views/study/MathView.vue'
import EnglishView from '../views/study/EnglishView.vue'
import OlympiadView from '../views/study/OlympiadView.vue'
import TechView from '../views/TechView.vue'
import GuitarView from '../views/GuitarView.vue'
import ShinesView from '../views/ShinesView.vue'
import ErrorBookView from '../views/study/ErrorBookView.vue'
import LearnReportView from '../views/study/LearnReportView.vue'
import MethodsView from '../views/study/MethodsView.vue'
import StudyCenter from '../views/study/StudyCenter.vue'
import KnowledgeTreeView from '../views/study/KnowledgeTreeView.vue'
import PrintView from '../views/study/PrintView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/diary', name: 'diary', component: DiaryView },
  { path: '/study', name: 'study', component: StudyCenter },
  { path: '/study/report', name: 'report', component: LearnReportView },
  { path: '/study/errors', name: 'errors', component: ErrorBookView },
  { path: '/study/methods', name: 'methods', component: MethodsView },
  { path: '/study/knowledge-tree', name: 'knowledge-tree', component: KnowledgeTreeView },
  { path: '/study/print', name: 'print-errors', component: PrintView },
  { path: '/study/chinese', name: 'chinese', component: ChineseView },
  { path: '/study/math', name: 'math', component: MathView },
  { path: '/study/english', name: 'english', component: EnglishView },
  { path: '/study/olympiad', name: 'olympiad', component: OlympiadView },
  { path: '/tech', name: 'tech', component: TechView },
  { path: '/guitar', name: 'guitar', component: GuitarView },
  { path: '/shines', name: 'shines', component: ShinesView },
  { path: '/errors', name: 'errors', component: ErrorBookView },
  { path: '/report', name: 'report', component: LearnReportView },
  { path: '/methods', name: 'methods', component: MethodsView },
  { path: '/knowledge-tree', name: 'knowledge-tree-alt', component: KnowledgeTreeView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
