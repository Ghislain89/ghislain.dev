<script setup lang="ts">
// Prefix absolute public paths with the build base (e.g. /ui/) so logos work in every deck
const asset = (src?: string) =>
  src?.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src
</script>

<template>
  <header
    v-if="
      $slidev.themeConfigs.logoHeader && $slidev.nav.currentLayout === 'intro'
    "
    class="absolute w-full px-16 py-8 top-0 h-10 z-10"
  >
    <img
      :src="asset($slidev.themeConfigs.logoHeader)"
      class="w-16 h-16 object-contain"
    />
  </header>
</template>
