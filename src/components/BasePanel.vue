<script setup lang="ts">
defineProps<{ title: string; accent: string }>()
</script>

<template>
  <section class="panel" :style="{ '--accent': accent }">
    <header class="panel-header">
      <h2>{{ title }}</h2>
      <slot name="meta" />
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem 0.45rem;
  border-top: 4px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--color-surface));
}

h2 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
}
</style>
