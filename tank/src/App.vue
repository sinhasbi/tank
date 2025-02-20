<template>
  <div class="game-container">
    <div id="game"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useGame } from "./game/useGame";
import SocketService from "./services/SocketService";

onMounted(() => {
  // 初始化 Socket 服務
  SocketService.getInstance();
  // 初始化遊戲
  useGame();
});

onUnmounted(() => {
  // 斷開 Socket 連接
  const socket = SocketService.getInstance().getSocket();
  socket.disconnect();
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
