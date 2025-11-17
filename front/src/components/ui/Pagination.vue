<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
    <div class="text-sm text-gray-700">
      Показано {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, total) }} из
      {{ total }}
    </div>
    <div class="flex gap-2">
      <Button
        :disabled="currentPage === 1"
        variant="outline"
        size="sm"
        @click="$emit('update:currentPage', currentPage - 1)"
      >
        Назад
      </Button>
      <template v-for="page in visiblePages" :key="page">
        <Button
          v-if="page !== '...'"
          :variant="page === currentPage ? 'primary' : 'outline'"
          size="sm"
          @click="$emit('update:currentPage', page)"
        >
          {{ page }}
        </Button>
        <span v-else class="px-3 py-2">...</span>
      </template>
      <Button
        :disabled="currentPage === totalPages"
        variant="outline"
        size="sm"
        @click="$emit('update:currentPage', currentPage + 1)"
      >
        Вперёд
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from './Button.vue';

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

const props = defineProps<Props>();

defineEmits<{
  'update:currentPage': [page: number];
}>();

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (props.currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(props.totalPages);
    } else if (props.currentPage >= props.totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = props.totalPages - 3; i <= props.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(props.totalPages);
    }
  }

  return pages;
});
</script>

