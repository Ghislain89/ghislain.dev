<script setup lang="ts">
import { resolveAssetUrl } from './layoutHelper'
</script>

<template>
  <header
    v-if="$slidev.themeConfigs.logoHeader && $slidev.nav.currentLayout === 'intro'"
    class="absolute top-0 left-0 px-14 py-8 z-10"
  >
    <img :src="resolveAssetUrl($slidev.themeConfigs.logoHeader)" class="w-16 h-16 object-contain" alt="">
  </header>
  <footer
    v-if="$slidev.nav.currentPage === 1 && ($slidev.themeConfigs.logoOne || $slidev.themeConfigs.logoTwo)"
    class="absolute bottom-0 left-0 w-full px-8 py-5 flex justify-between items-center z-10"
  >
    <img v-if="$slidev.themeConfigs.logoOne" :src="resolveAssetUrl($slidev.themeConfigs.logoOne)" class="h-8" alt="">
    <span v-else />
    <img v-if="$slidev.themeConfigs.logoTwo" :src="resolveAssetUrl($slidev.themeConfigs.logoTwo)" class="h-12" alt="">
  </footer>
</template>
