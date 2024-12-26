// src/game/GameState.js
import { Controls } from '../ui/Controls';
import { PowerUp } from './Powerup';

export class GameState {
    constructor(canvas) {
        this.canvas = canvas;
        this.controls = new Controls();
        this.isPlaying = false;
        this.targetScore = 0;
        this.roundActive = false;
        this.readyToStart = false;
        this.players = [];
        this.powerUps = [];
        this.timestampWhenPaused = null;
    }

    initializeGame(players) {
        this.players = players;
        this.targetScore = (players.length - 1) * 10;
        this.powerUps = [];
    }

    checkCollisions(player) {
        const { x, y } = player.position;
        const PLAYER_RADIUS = 4;
        const TRAIL_WIDTH = 4;

        if (x - PLAYER_RADIUS <= 0 || x + PLAYER_RADIUS >= this.canvas.canvas.width || 
            y - PLAYER_RADIUS <= 0 || y + PLAYER_RADIUS >= this.canvas.canvas.height) {
            return true;
        }

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

    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            if (!powerUp.collected) {
                this.players.forEach(player => {
                    if (player.isAlive && powerUp.checkCollision(player)) {
                        powerUp.apply(this, player);
                    }
                });
                return true;
            } else {
                if (!this.isPlaying) {
                    return true;
                }
                return !powerUp.update(this);
            }
        });

        if (this.isPlaying) {
            const newPowerUp = PowerUp.spawnPowerUp(this.canvas);
            if (newPowerUp) {
                this.powerUps.push(newPowerUp);
            }
        }
    }

    initializePlayerPositions() {
        this.players.forEach(player => {
            player.speed = 2;
            player.headColor = 'yellow';
            player.controls = { 
                left: player.originalControls?.left || player.controls.left,
                right: player.originalControls?.right || player.controls.right 
            };
            player.position = {
                x: Math.random() * (this.canvas.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.canvas.height - 100) + 50
            };
            player.angle = Math.random() * Math.PI * 2;
            player.isAlive = true;
            player.trail = [];
            
            for (let i = 0; i < 5; i++) {
                player.trail.push({
                    x: player.position.x - (Math.cos(player.angle) * i * 5),
                    y: player.position.y - (Math.sin(player.angle) * i * 5)
                });
            }
        });
    }

    startNewRound() {
        this.initializePlayerPositions();
        this.powerUps = [];
        this.readyToStart = true;
        this.roundActive = false;
        this.timestampWhenPaused = null;
    }

    updateScores() {
        let playersAlive = this.players.filter(p => p.isAlive).length;
        if (playersAlive >= 1) {
            this.players.forEach(player => {
                if (player.isAlive && playersAlive < this.players.length) {
                    player.score++;
                }
            });
        }
    }

    checkWinningCondition() {
        if (!this.players.length) return false;
        
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const highestScore = sortedPlayers[0].score;
        const secondHighestScore = sortedPlayers[1]?.score || 0;

        if (highestScore >= this.targetScore && (highestScore - secondHighestScore) >= 2) {
            this.players.forEach(player => player.reset());
            return true;
        }
        return false;
    }

    endRound() {
        this.roundActive = false;
        this.isPlaying = false;
        this.timestampWhenPaused = null;
    }

    togglePlay() {
        if (!this.roundActive && !this.readyToStart) {
            this.startNewRound();
        } else if (this.readyToStart) {
            this.roundActive = true;
            this.readyToStart = false;
            this.isPlaying = true;
            if (this.timestampWhenPaused) {
                const pauseDuration = Date.now() - this.timestampWhenPaused;
                this.powerUps.forEach(powerUp => {
                    if (powerUp.collected) {
                        powerUp.collectedTime += pauseDuration;
                    }
                });
                this.timestampWhenPaused = null;
            }
        } else {
            this.isPlaying = !this.isPlaying;
            if (!this.isPlaying) {
                this.timestampWhenPaused = Date.now();
            } else if (this.timestampWhenPaused) {
                const pauseDuration = Date.now() - this.timestampWhenPaused;
                this.powerUps.forEach(powerUp => {
                    if (powerUp.collected) {
                        powerUp.collectedTime += pauseDuration;
                    }
                });
                this.timestampWhenPaused = null;
            }
        }
    }
}
