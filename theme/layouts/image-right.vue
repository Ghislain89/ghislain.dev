<script setup lang="ts">
import { backgroundStyle } from '../layoutHelper'

const props = withDefaults(defineProps<{ image?: string, class?: string, imageColClass?: string }>(), {
  imageColClass: 'my-14 mr-14 rounded-lg',
})
</script>

<template>
  <div class="grid grid-cols-2 w-full h-full">
    <div class="slidev-layout default" :class="props.class"><slot /></div>
    <div :class="imageColClass" :style="backgroundStyle(image)" />
  </div>
</template>
