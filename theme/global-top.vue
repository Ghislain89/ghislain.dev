<script setup lang="ts">
// Prefix absolute public paths with the build base (e.g. /ui/) so logos work in every deck
const asset = (src?: string) =>
  src?.startsWith('/') ? import.meta.env.BASE_URL + src.slice(1) : src
</script>

<template>
  <footer
    v-if="$slidev.nav.currentPage === 1 && ($slidev.themeConfigs.logoOne || $slidev.themeConfigs.logoTwo)"
    class="absolute bottom-0 p-4 mt-auto flex justify-between items-center w-full text-primary dark:text-white z-10"
  >
    <div class="mb-0 flex items-center">
      <img
        v-if="$slidev.themeConfigs.logoOne"
        :src="asset($slidev.themeConfigs.logoOne)"
        class="h-8 ml-8"
        alt="Event image"
      />
    </div>
    <div class="mb-0 flex items-center">
      <img
        v-if="$slidev.themeConfigs.logoTwo"
        :src="asset($slidev.themeConfigs.logoTwo)"
        class="h-12 mr-8"
        alt="Event image"
      />
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>