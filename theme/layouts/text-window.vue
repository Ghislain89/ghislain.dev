<script setup lang="ts">
defineProps<{ reverse?: boolean }>()
</script>

<template>
  <div class="slidev-layout text-window">
    <div class="tn-cols halves">
      <div :class="{ 'order-1': reverse }"><slot /></div>
      <TheConsole><slot name="window" /></TheConsole>
    </div>
  </div>
</template>
