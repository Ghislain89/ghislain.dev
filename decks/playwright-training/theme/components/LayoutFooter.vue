<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'

defineProps({
  logoOne: {
    type: String,
  },
  logoTwo: {
    type: String,
  },
})

const { now } = useNow()

const date = computed(() => now?.value.toLocaleDateString('en-US'))
</script>

<template>
  <footer
    v-if="logoOne || logoTwo"
    class="mt-auto flex justify-between items-center w-full text-primary dark:text-white z-10"
  >
    <div class="mb-0 flex items-center">
      <img
        :src="logoOne"
        class="h-8 mr-4"
        alt="Event image"
      />
      <img
        :src="logoTwo"
        class="h-12 mr-10"
        alt="Event image"
      />
    </div>
  </footer>
</template>

<style scoped>
a {
  border-color: transparent;
}
</style>
