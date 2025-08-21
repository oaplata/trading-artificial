<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Trading Artificial</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">BFF Status:</span>
              <div 
                :class="[
                  'w-3 h-3 rounded-full',
                  bffStatus === 'ok' ? 'bg-success-500' : 'bg-danger-500'
                ]"
              ></div>
              <span class="text-sm font-medium" :class="bffStatus === 'ok' ? 'text-success-600' : 'text-danger-600'">
                {{ bffStatus === 'ok' ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar para futuros módulos -->
        <div class="lg:col-span-1">
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Módulos</h2>
            <nav class="space-y-2">
              <a href="#" class="block px-3 py-2 rounded-md text-sm font-medium text-primary-600 bg-primary-50">
                📈 Líneas de Tendencia
              </a>
              <a href="#" class="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                📊 Análisis Técnico
              </a>
              <a href="#" class="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                🌍 Análisis Macro
              </a>
            </nav>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="lg:col-span-2">
          <ChartView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChartView from './views/ChartView.vue'
import axios from 'axios'

const bffStatus = ref('unknown')

const checkBffHealth = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BFF_URL}/health`)
    bffStatus.value = response.data.status
  } catch (error) {
    bffStatus.value = 'error'
  }
}

onMounted(() => {
  checkBffHealth()
  // Verificar estado cada 30 segundos
  setInterval(checkBffHealth, 30000)
})
</script>
