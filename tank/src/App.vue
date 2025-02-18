<template>
  <div class="game-container">
    <div id="game"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useGame } from "./game/useGame";

onMounted(() => {
  useGame();
});
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #f0f0f0; */
}

canvas {
  display: block;
}
</style>
