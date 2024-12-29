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
canvas.setGameState(gameState);
const scoreboard = new Scoreboard();
let currentState = 'home';
let lastFrameTime = 0;

function switchScreen(screen) {
    if (screen === 'home') {
        homeScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    } else {
        homeScreen.style.display = 'none';
        gameScreen.style.display = 'block';
    }
}

function drawPlayer(player, ctx) {
    // Draw trail
    if (player.trail.length > 1 && player.trailSegments.length > 0) {
        ctx.strokeStyle = player.color;
        let segmentIndex = 0;
        let lastPos = null;
        let currentPath = new Path2D();
        let currentWidth = player.trailSegments[0].width;

        player.trail.forEach((point, index) => {
            // Update segment if needed
            while (segmentIndex < player.trailSegments.length - 1 && 
                   index >= player.trailSegments[segmentIndex + 1].startIndex) {
                if (lastPos) {
                    ctx.lineWidth = currentWidth;
                    ctx.stroke(currentPath);
                    currentPath = new Path2D();
                }
                segmentIndex++;
                currentWidth = player.trailSegments[segmentIndex].width;
            }

            if (!point) {
                if (lastPos) {
                    ctx.lineWidth = currentWidth;
                    ctx.stroke(currentPath);
                    currentPath = new Path2D();
                }
            } else {
                if (!lastPos) {
                    currentPath.moveTo(point.x, point.y);
                } else {
                    currentPath.lineTo(point.x, point.y);
                }
            }
            lastPos = point;
        });

        if (lastPos) {
            ctx.lineWidth = currentWidth;
            ctx.stroke(currentPath);
        }
    }

    // Draw player head
    if (player.isAlive) {
        // Draw head trail effect when border wrap is active
        if (player.isBorderWrapEnabled || gameState.isBorderWrapActive) {
            ctx.fillStyle = `rgba(${player.headColor === '#0000FF' ? '0,0,255' : '255,255,0'}, ${player.headOpacity})`;
        } else {
            ctx.fillStyle = player.headColor === '#0000FF' ? 'blue' : 'yellow';
        }

        if (player.isSquareHead) {
            const squareSize = player.headRadius * 2;
            ctx.fillRect(
                player.position.x - squareSize/2,
                player.position.y - squareSize/2,
                squareSize,
                squareSize
            );
        } else {
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, player.headRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw invincibility indicator
        if (player.isInvincible) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, player.headRadius * 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (currentState === 'home') {
        homeState.draw();
    } else {
        canvas.clear();
        gameState.updateBorderOpacity();
        
        if (gameState.isPlaying && gameState.roundActive) {
            let alivePlayers = 0;
            
            // Update players
            gameState.players.forEach(player => {
                player.updateHeadOpacity();
                
                if (player.isAlive) {
                    // Handle controls
                    const leftPressed = gameState.controls.isPressed(player.controls.left);
                    const rightPressed = gameState.controls.isPressed(player.controls.right);
                    
                    if (player.isSquareTurn) {
                        if (leftPressed && !player.lastPressedKeys.left) {
                            player.turn(-1);
                        } else if (rightPressed && !player.lastPressedKeys.right) {
                            player.turn(1);
                        }
                        player.lastPressedKeys.left = leftPressed;
                        player.lastPressedKeys.right = rightPressed;
                    } else {
                        if (leftPressed) player.turn(-1);
                        if (rightPressed) player.turn(1);
                    }
                    
                    player.move();
                    
                    if (gameState.checkCollisions(player)) {
                        if (player.isAlive) {
                            player.isAlive = false;
                            alivePlayers = gameState.players.filter(p => p.isAlive).length;
                            if (alivePlayers > 0) {
                                gameState.updateScores();
                            }
                        }
                    } else {
                        alivePlayers++;
                    }
                }
            });

            // Update and spawn power-ups
            gameState.updatePowerUps();

            // Check round end conditions
            if (alivePlayers <= 1) {
                if (gameState.checkWinningCondition()) {
                    currentState = 'home';
                    switchScreen('home');
                } else {
                    gameState.endRound();
                }
            }
        }

        // Draw power-ups
        gameState.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                powerUp.draw(canvas.ctx);
            }
        });

        // Draw all players
        gameState.players.forEach(player => {
            drawPlayer(player, canvas.ctx);
        });

        // Update scoreboard
        if (currentState === 'game') {
            scoreboard.draw(gameState.players);
        }
    }
    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', (e) => {
    if (currentState === 'home') {
        if (e.key === ' ' && homeState.getSelectedPlayers().length >= 2) {
            currentState = 'game';
            switchScreen('game');
            const selectedPlayers = homeState.getSelectedPlayers();
            const players = selectedPlayers.map(p => 
                new Player(
                    p.name, 
                    p.color, 
                    p.left.toLowerCase(), 
                    p.right.toLowerCase(), 
                    Math.random() * (canvas.canvas.width - 100) + 50,
                    Math.random() * (canvas.canvas.height - 100) + 50
                )
            );
            gameState.initializeGame(players);
        } else {
            homeState.handleKeyPress(e.key);
        }
    } else {
        if (e.key === ' ') {
            gameState.togglePlay();
        }
        if (e.key === 'Escape') {
            currentState = 'home';
            switchScreen('home');
        }
    }
});

// Start the game loop
requestAnimationFrame(gameLoop);
