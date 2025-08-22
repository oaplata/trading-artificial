import { createRouter, createWebHistory } from 'vue-router'
import DatasetsList from '@/modules/data/pages/DatasetsList.vue'
import DatasetChart from '@/modules/data/pages/DatasetChart.vue'

const routes = [
  {
    path: '/',
    redirect: '/data'
  },
  {
    path: '/data',
    name: 'DatasetsList',
    component: DatasetsList
  },
  {
    path: '/data/upload',
    name: 'UploadDataset',
    component: () => import('@/modules/data/pages/UploadDataset.vue')
  },
  {
    path: '/data/:id',
    name: 'DatasetChart',
    component: DatasetChart,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
