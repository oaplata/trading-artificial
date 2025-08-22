<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">T</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Trading Artificial</span>
            </router-link>
          </div>

          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/data"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              :class="[
                route.path === '/data'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              📊 Datasets
            </router-link>
            
            <router-link
              to="/data/upload"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              :class="[
                route.path === '/data/upload'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              📤 Subir Dataset
            </router-link>
          </div>
        </div>

        <!-- Right side -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <div class="flex items-center space-x-4">
            <!-- Status indicator -->
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 rounded-full" :class="bffStatus === 'ok' ? 'bg-green-400' : 'bg-red-400'"></div>
              <span class="text-xs text-gray-500">BFF</span>
            </div>
            
            <!-- Version -->
            <span class="text-xs text-gray-400">
              v{{ appVersion }}
            </span>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span class="sr-only">Abrir menú principal</span>
            <svg
              :class="mobileMenuOpen ? 'hidden' : 'block'"
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              :class="mobileMenuOpen ? 'block' : 'hidden'"
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div :class="mobileMenuOpen ? 'block' : 'hidden'" class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
                <router-link
          to="/data"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
          :class="[
            route.path === '/data'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="mobileMenuOpen = false"
        >
          📊 Datasets
        </router-link>
        
        <router-link
          to="/data/upload"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
          :class="[
            route.path === '/data/upload'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="mobileMenuOpen = false"
        >
          📤 Subir Dataset
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const mobileMenuOpen = ref(false);
const bffStatus = ref<'ok' | 'error'>('error');
const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0');

let healthCheckInterval: NodeJS.Timeout;

const checkBffHealth = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BFF_URL || 'http://localhost:3000'}/health`);
    if (response.ok) {
      bffStatus.value = 'ok';
    } else {
      bffStatus.value = 'error';
    }
  } catch {
    bffStatus.value = 'error';
  }
};

onMounted(() => {
  checkBffHealth();
  healthCheckInterval = setInterval(checkBffHealth, 30000); // Check every 30 seconds
});

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
});
</script>
