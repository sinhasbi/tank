class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = {};
  }

  // 建立房間（單一職責：管理房間的產生）
  createRoom(roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = { players: [], currentPlayer: 0, turnTime: 30 };
    }
  }

  // 加入玩家到房間
  addPlayer(roomId, socket, playerName) {
    this.createRoom(roomId);
    if (this.rooms[roomId].players.length < 4) {
      // 為新玩家設定初始位置
      const initialPosition = {
        x: 200 + (this.rooms[roomId].players.length * 200), // 玩家間隔 200 像素
        y: 300 // 固定高度
      };

      const newPlayer = {
        id: socket.id,
        name: playerName,
        hp: 100,
        position: initialPosition
      };

      this.rooms[roomId].players.push(newPlayer);
      socket.join(roomId);
      
      console.log(`玩家 ${playerName} 加入房間 ${roomId}，位置:`, initialPosition);
      
      // 發送更新給所有玩家
      this.io.to(roomId).emit('updatePlayers', this.rooms[roomId].players);
      
      if (this.rooms[roomId].players.length === 4) {
        this.startGame(roomId);
      }
    } else {
      socket.emit('error', '房間已滿');
    }
  }

  // 處理玩家行動
  handlePlayerAction(roomId, socket, action) {
    const room = this.rooms[roomId];
    if (room && room.players[room.currentPlayer].id === socket.id) {
      if (action.type === 'move') {
        const player = room.players.find(p => p.id === socket.id);
        player.position.x += action.distance;
      } else if (action.type === 'attack') {
        this.io.to(roomId).emit('attack', { shooterId: socket.id, angle: action.angle, power: action.power });
        this.nextTurn(roomId);
      }
      this.io.to(roomId).emit('updatePlayers', room.players);
    }
  }

  // 遊戲開始
  startGame(roomId) {
    this.io.to(roomId).emit('startGame');
    setTimeout(() => this.nextTurn(roomId), 1000);
  }

  // 換下一位玩家
  nextTurn(roomId) {
    const room = this.rooms[roomId];
    if (room && room.players.length > 0) {
      room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
      this.io.to(roomId).emit('nextTurn', { 
        currentPlayerId: room.players[room.currentPlayer].id 
      });
    }
  }

  // 處理玩家斷線
  handleDisconnect(socket) {
    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      const disconnectedPlayer = room.players.find(p => p.id === socket.id);
      
      if (disconnectedPlayer) {
        // 從房間中移除玩家
        room.players = room.players.filter(p => p.id !== socket.id);
        
        // 通知房間內其他玩家
        this.io.to(roomId).emit('playerDisconnect', socket.id);
        this.io.to(roomId).emit('systemMessage', `玩家 ${disconnectedPlayer.name} 已離開遊戲`);
        
        // 更新玩家列表
        this.io.to(roomId).emit('updatePlayers', room.players);
        
        // 如果是當前玩家，切換到下一個玩家
        if (room.players.length > 0 && 
            room.players[room.currentPlayer]?.id === socket.id) {
          this.nextTurn(roomId);
        }
        
        // 如果房間空了，清理房間
        if (room.players.length === 0) {
          delete this.rooms[roomId];
        }
      }
    }
  }
}

module.exports = GameManager; 