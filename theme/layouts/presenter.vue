<script setup lang="ts">
import { resolveAssetUrl } from '../layoutHelper'

defineProps<{ presenterImage?: string }>()
</script>

<template>
  <div class="slidev-layout presenter">
    <div class="tn-presenter">
      <div><slot /></div>
      <figure v-if="presenterImage" class="tn-avatar">
        <img :src="resolveAssetUrl(presenterImage)" alt="">
      </figure>
    </div>
  </div>
</template>
