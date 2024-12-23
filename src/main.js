// src/main.js
import '../style.css';
import { Canvas } from './ui/Canvas';
import { Player } from './game/Player';
import { GameState } from './game/GameState';
import { Controls } from './ui/Controls';

const canvas = new Canvas();
const gameState = new GameState(canvas);
const players = [
  new Player('Fred', 'red', 'a', 'd', 200, 200),
  new Player('Bluebell', 'cyan', 'n', 'm', 600, 400)
];
gameState.players = players;

function gameLoop() {
  canvas.clear();
  
  if (gameState.isPlaying && gameState.roundActive) {
      let alivePlayers = 0;
      
      players.forEach(player => {
          if (player.isAlive) {
              if (gameState.controls.isPressed(player.controls.left)) {
                  player.turn(-1);
              }
              if (gameState.controls.isPressed(player.controls.right)) {
                  player.turn(1);
              }
              player.move();
              
              if (gameState.checkCollisions(player)) {
                  player.isAlive = false;
              }
              alivePlayers++;
          }
      });

      if (alivePlayers <= 1) {
          gameState.roundActive = false;
          gameState.isPlaying = false;
      }
  }

  players.forEach(player => {
      if (player.isAlive) {
          const ctx = canvas.ctx;
          
          // Draw trail
          if (player.trail.length > 1) {
              ctx.strokeStyle = player.color;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(player.trail[0].x, player.trail[0].y);
              player.trail.forEach(point => {
                  ctx.lineTo(point.x, point.y);
              });
              ctx.stroke();
          }

          // Draw player head
          ctx.fillStyle = player.color;
          ctx.beginPath();
          ctx.arc(player.position.x, player.position.y, 3, 0, Math.PI * 2);
          ctx.fill();
      }
  });

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') gameState.togglePlay();
});

gameLoop();
