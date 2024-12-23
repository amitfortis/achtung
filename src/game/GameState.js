// src/game/GameState.js
import { Controls } from '../ui/Controls';

export class GameState {
   constructor(canvas) {
       this.canvas = canvas;
       this.controls = new Controls();
       this.isPlaying = false;
       this.targetScore = 10;
       this.roundActive = false;
       this.readyToStart = false;
       this.players = [];
   }

   checkCollisions(player) {
       // Wall collision
       const { x, y } = player.position;
       if (x <= 0 || x >= this.canvas.canvas.width || 
           y <= 0 || y >= this.canvas.canvas.height) {
           return true;
       }

       // Trail collision - check against all trails including own
       const MIN_DISTANCE = 2;
       return this.players.some(otherPlayer => {
           // Skip first few points of current player's trail to avoid self-collision at start
           const trailToCheck = otherPlayer === player ? 
               otherPlayer.trail.slice(0, -5) : otherPlayer.trail;
           
           return trailToCheck.some(point => {
               const dx = point.x - x;
               const dy = point.y - y;
               const distance = Math.sqrt(dx * dx + dy * dy);
               return distance < MIN_DISTANCE;
           });
       });
   }

   startNewRound() {
       this.players.forEach(player => {
           player.position = this.getRandomPosition();
           player.angle = Math.random() * Math.PI * 2;
           player.isAlive = true;
           player.trail = [];
       });
       this.readyToStart = true;
       this.roundActive = false;
   }

   getRandomPosition() {
    return {
        x: Math.random() * (this.canvas.canvas.width - 100) + 50,
        y: Math.random() * (this.canvas.canvas.height - 100) + 50
    };
  }

   
   togglePlay() {
       if (!this.roundActive && !this.readyToStart) {
           this.startNewRound();
       } else if (this.readyToStart) {
           this.roundActive = true;
           this.readyToStart = false;
           this.isPlaying = true;
       } else {
           this.isPlaying = !this.isPlaying;
       }
    }
}
