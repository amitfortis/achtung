// src/game/GameState.js
import { Controls } from '../ui/Controls';

export class GameState {
   constructor(canvas) {
       this.canvas = canvas;
       this.controls = new Controls();
       this.isPlaying = false;
       this.targetScore = 0;
       this.roundActive = false;
       this.readyToStart = false;
       this.players = [];
   }

   initializeGame(players) {
       this.players = players;
       this.targetScore = (players.length - 1) * 10;
   }

   checkCollisions(player) {
       const { x, y } = player.position;
       const PLAYER_RADIUS = 4;
       const TRAIL_WIDTH = 4;

       // Wall collision
       if (x - PLAYER_RADIUS <= 0 || x + PLAYER_RADIUS >= this.canvas.canvas.width || 
           y - PLAYER_RADIUS <= 0 || y + PLAYER_RADIUS >= this.canvas.canvas.height) {
           return true;
       }

       // Trail collision
       return this.players.some(otherPlayer => {
           const trailToCheck = otherPlayer === player ? 
               otherPlayer.trail.slice(0, -10) : otherPlayer.trail;

           return trailToCheck.some(point => {
               if (!point) return false;
               const dx = point.x - x;
               const dy = point.y - y;
               return Math.sqrt(dx * dx + dy * dy) < PLAYER_RADIUS + TRAIL_WIDTH;
           });
       });
   }

   startNewRound() {
       this.players.forEach(player => {
           player.position = {
               x: Math.random() * (this.canvas.canvas.width - 100) + 50,
               y: Math.random() * (this.canvas.canvas.height - 100) + 50
           };
           player.angle = Math.random() * Math.PI * 2;
           player.isAlive = true;
           player.trail = [];
       });
       this.readyToStart = true;
       this.roundActive = false;
   }
    
    updateScores() {
    let playersAlive = this.players.filter(p => p.isAlive).length;
    if (playersAlive >= 1) {
        this.players.forEach(player => {
            // Award a point to each player that's still alive
            if (player.isAlive && playersAlive < this.players.length) {
                player.score++;
            }
        });
      }
    } 

   checkWinningCondition() {
       if (!this.players.length) return false;
        
        // Sort players by score in descending order
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const highestScore = sortedPlayers[0].score;
        const secondHighestScore = sortedPlayers[1]?.score || 0;

        return highestScore >= this.targetScore && 
                (highestScore - secondHighestScore) >= 2; 

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
