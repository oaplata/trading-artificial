<template>
  <div
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="triggerFileInput"
    class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
    :class="[
      isDragOver ? 'border-blue-400 bg-blue-50' : '',
      selectedFile ? 'border-green-400 bg-green-50' : ''
    ]"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      class="hidden"
      @change="handleFileChange"
    />
    
    <div v-if="!selectedFile" class="space-y-4">
      <div class="text-6xl">📁</div>
      <div>
        <p class="text-lg font-medium text-gray-900">
          Arrastra y suelta tu archivo CSV aquí
        </p>
        <p class="text-sm text-gray-500 mt-1">
          o haz clic para seleccionar un archivo
        </p>
      </div>
      <div class="text-xs text-gray-400">
        Solo archivos CSV hasta 100MB
      </div>
    </div>
    
    <div v-else class="space-y-4">
      <div class="text-6xl">✅</div>
      <div>
        <p class="text-lg font-medium text-gray-900">
          Archivo seleccionado
        </p>
        <p class="text-sm text-gray-600 mt-1">
          {{ selectedFile.name }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          {{ formatFileSize(selectedFile.size) }}
        </p>
      </div>
      <button
        @click.stop="removeFile"
        class="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
      >
        Cambiar archivo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  maxSize?: number; // en bytes
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 100 * 1024 * 1024, // 100MB por defecto
});

const emit = defineEmits<{
  'file-selected': [file: File];
  'file-removed': [];
}>();

const fileInput = ref<HTMLInputElement>();
const selectedFile = ref<File | null>(null);
const isDragOver = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    validateAndSelectFile(file);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    validateAndSelectFile(file);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const validateAndSelectFile = (file: File) => {
  // Validar tipo de archivo
  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('Solo se permiten archivos CSV');
    return;
  }
  
  // Validar tamaño
  if (file.size > props.maxSize) {
    alert(`El archivo es demasiado grande. Máximo: ${formatFileSize(props.maxSize)}`);
    return;
  }
  
  selectedFile.value = file;
  emit('file-selected', file);
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('file-removed');
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>
