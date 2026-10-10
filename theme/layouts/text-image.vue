<script setup lang="ts">
import { resolveAssetUrl } from '../layoutHelper'

defineProps<{ media?: string, caption?: string, reverse?: boolean }>()
</script>

<template>
  <div class="slidev-layout text-image">
    <div class="tn-cols halves items-center h-full">
      <div :class="{ 'order-1': reverse }"><slot /></div>
      <figure>
        <img :src="resolveAssetUrl(media)" class="w-full object-cover shadow-xl" alt="">
        <figcaption v-if="caption" class="mt-2 text-xs opacity-70">{{ caption }}</figcaption>
      </figure>
    </div>
  </div>
</template>
