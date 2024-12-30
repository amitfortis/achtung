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
        this.borderOpacity = 1;
        this.isBorderWrapActive = false;
        this.baseSpawnRate = 0.005;
        this.spawnRate = this.baseSpawnRate;
    }

    initializeGame(players) {
        this.players = players;
        this.targetScore = (players.length - 1) * 10;
        this.powerUps = [];
    }

    checkCollisions(player) {
    if (!player.isAlive) return false;
    
    const { x, y } = player.position;
    const currentRadius = player.getCurrentCollisionRadius();
    const width = this.canvas.canvas.width;
    const height = this.canvas.canvas.height;

    // Handle border wrapping
    const shouldWrap = (this.isBorderWrapActive || player.isBorderWrapEnabled);
    if (shouldWrap) {
        if (x < 0) player.position.x = width;
        if (x > width) player.position.x = 0;
        if (y < 0) player.position.y = height;
        if (y > height) player.position.y = 0;
    } else if (x - currentRadius <= 0 || x + currentRadius >= width || 
               y - currentRadius <= 0 || y + currentRadius >= height) {
        return true;
    }

    if (player.isInvincible) {
        return false;
    }

    // Check trail collisions with dynamic radius
    return this.players.some(otherPlayer => {
        // Increase the number of skipped points for square turn + fat line combination
        const skipPoints = player === otherPlayer ? 
            (player.isSquareTurn ? 20 : 10) * (player.currentLineWidth / player.defaultLineWidth) : 0;
            
        const trailToCheck = otherPlayer === player ? 
            otherPlayer.trail.slice(0, -skipPoints) : otherPlayer.trail;

        let segmentIndex = 0;
        return trailToCheck.some((point, index) => {
            if (!point) return false;

            // Update segment index if needed
            while (segmentIndex < otherPlayer.trailSegments.length - 1 && 
                   index >= otherPlayer.trailSegments[segmentIndex + 1].startIndex) {
                segmentIndex++;
            }

            // Get current segment width for collision
            const segmentWidth = otherPlayer.trailSegments[segmentIndex].width / 2;
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Add extra padding for square turn to prevent self-collision
            const collisionPadding = player.isSquareTurn ? segmentWidth * 0.5 : 0;
            
            return distance < (currentRadius + segmentWidth + collisionPadding);
        });
    });
}
   updatePowerUps() {
    // Update existing powerups
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

    // Spawn new powerups
    if (this.isPlaying && Math.random() < this.spawnRate) {
        const newPowerUp = new PowerUp(this.canvas, this.getRandomPowerUpType());
        // Verify position isn't overlapping
        const isValidPosition = !this.powerUps.some(existingPowerUp => {
            if (existingPowerUp.collected) return false;
            const dx = existingPowerUp.position.x - newPowerUp.position.x;
            const dy = existingPowerUp.position.y - newPowerUp.position.y;
            return Math.sqrt(dx * dx + dy * dy) < newPowerUp.radius * 3;
        });

        if (isValidPosition) {
            this.powerUps.push(newPowerUp);
        }
    }
}

getRandomPowerUpType() {
    const types = Object.values(PowerUp.TYPES);
    return types[Math.floor(Math.random() * types.length)];
}
    initializePlayerPositions() {
        const minDistance = 100; // Minimum distance between players
        const padding = 50;   // Padding from borders

        const positions = [];
        this.players.forEach(player => {
            let validPosition = false;
            let attempts = 0;
            let newPos;

            // Try to find a valid position
            while (!validPosition && attempts < 100) {
                newPos = {
                    x: Math.random() * (this.canvas.canvas.width - 2 * padding) + padding,
                    y: Math.random() * (this.canvas.canvas.height - 2 * padding) + padding
                };

                // Check distance from other players
                validPosition = !positions.some(pos => {
                    const dx = newPos.x - pos.x;
                    const dy = newPos.y - pos.y;
                    return Math.sqrt(dx * dx + dy * dy) < minDistance;
                });

                attempts++;
            }

            // Reset player state
            player.position = newPos;
            player.angle = Math.random() * Math.PI * 2;
            player.isAlive = true;
            player.trail = [];
            player.resetEffects();
            
            // Initialize trail
            for (let i = 0; i < 5; i++) {
                player.trail.push({
                    x: player.position.x - (Math.cos(player.angle) * i * 5),
                    y: player.position.y - (Math.sin(player.angle) * i * 5)
                });
            }

            positions.push(newPos);
        });
    }

   startNewRound() {
        // This is called when space is pressed
        this.initializePlayerPositions();
        this.powerUps = [];  // Now we clear power-ups
        this.readyToStart = true;
        this.roundActive = false;
        this.isBorderWrapActive = false;
        
        // Reset players when actually starting new round
        this.players.forEach(player => {
            player.reset();
        });
    }  

  updateScores() {
        const playersAlive = this.players.filter(p => p.isAlive).length;
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
        this.isBorderWrapActive = false;
        
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

   updateBorderOpacity() {
        const hasActiveBlueBorderWrap = this.powerUps.some(p => 
            p.type === PowerUp.TYPES.BORDER_WRAP && 
            p.color === '#0000FF' && 
            p.collected
        );

        if (this.isBorderWrapActive && hasActiveBlueBorderWrap) {
            this.borderOpacity = Math.round(Math.sin(Date.now() / 200));
        } else {
            this.borderOpacity = 1; // Always opaque when no blue border wrap
        }
}}
