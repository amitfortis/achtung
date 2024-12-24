// src/main.js
import '../style.css';
import { Canvas } from './ui/Canvas';
import { Player } from './game/Player';
import { GameState } from './game/GameState';
import { HomeState } from './game/HomeState';
import { Controls } from './ui/Controls';
import { Scoreboard } from './ui/Scoreboard';

const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const canvas = new Canvas();
const homeState = new HomeState(canvas);
const gameState = new GameState(canvas);
const scoreboard = new Scoreboard();
let currentState = 'home';

function switchScreen(screen) {
   if (screen === 'home') {
       homeScreen.style.display = 'block';
       gameScreen.style.display = 'none';
   } else {
       homeScreen.style.display = 'none';
       gameScreen.style.display = 'block';
   }
}

function gameLoop() {
   if (currentState === 'home') {
       homeState.draw();
   } else {
       canvas.clear();
       
       if (gameState.isPlaying && gameState.roundActive) {
           let alivePlayers = 0;
           
           gameState.players.forEach(player => {
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
                   } else {
                       alivePlayers++;
                   }
               }
           });

           if (alivePlayers <= 1) {
               gameState.updateScores();
               if (gameState.checkWinningCondition()) {
                   currentState = 'home';
                   switchScreen('home');
               } else {
                   gameState.roundActive = false;
                   gameState.isPlaying = false;
               }
           }
       }

       gameState.players.forEach(player => {
           const ctx = canvas.ctx;
           
           if (player.trail.length > 1) {
               ctx.strokeStyle = player.color;
               ctx.lineWidth = 8;
               ctx.beginPath();
               let lastPos = null;
               player.trail.forEach(point => {
                   if (point === null) {
                       ctx.stroke();
                       ctx.beginPath();
                   } else if (lastPos) {
                       ctx.moveTo(lastPos.x, lastPos.y);
                       ctx.lineTo(point.x, point.y);
                   }
                   lastPos = point;
               });
               ctx.stroke();
           }

           if (player.isAlive) {
               ctx.fillStyle = player.color;
               ctx.beginPath();
               ctx.arc(player.position.x, player.position.y, 4, 0, Math.PI * 2);
               ctx.fill();
           }
       });
       if (currentState === 'game') {
       scoreboard.draw(gameState.players);
    }
   }
   requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
   if (currentState === 'home') {
       if (e.key === ' ' && homeState.getSelectedPlayers().length >= 2) {
           currentState = 'game';
           switchScreen('game');
           const selectedPlayers = homeState.getSelectedPlayers();
           const players = selectedPlayers.map(p => 
               new Player(p.name, p.color, p.left.toLowerCase(), p.right.toLowerCase(), 
                   Math.random() * (canvas.canvas.width - 100) + 50,
                   Math.random() * (canvas.canvas.height - 100) + 50)
           );
           gameState.initializeGame(players);
       } else {
           homeState.handleKeyPress(e.key);
       }
   } else {
       if (e.key === ' ') gameState.togglePlay();
       if (e.key === 'Escape') {
           currentState = 'home';
           switchScreen('home');
       }
   }
});

gameLoop();
