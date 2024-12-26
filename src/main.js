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

            gameState.updatePowerUps();

            if (alivePlayers <= 1) {
                gameState.players.forEach(player => player.reset());
                
                if (gameState.checkWinningCondition()) {
                    currentState = 'home';
                    switchScreen('home');
                } else {
                    gameState.endRound();
                }
            }
        }

        // Draw powerups
        gameState.powerUps.forEach(powerUp => {
            powerUp.draw(canvas.ctx);
        });

        // Draw players
        gameState.players.forEach(player => {
            if (player.trail.length > 1) {
                canvas.ctx.strokeStyle = player.color;
                let segmentIndex = 0;
                let lastPos = null;

                player.trail.forEach((point, index) => {
                    // Get current segment width
                    while (segmentIndex < player.trailSegments.length - 1 && 
                           index >= player.trailSegments[segmentIndex + 1].startIndex) {
                        segmentIndex++;
                    }
                    canvas.ctx.lineWidth = player.trailSegments[segmentIndex].width;

                    if (point === null) {
                        if (lastPos) {
                            canvas.ctx.stroke();
                            canvas.ctx.beginPath();
                        }
                    } else {
                        if (!lastPos) {
                            canvas.ctx.beginPath();
                            canvas.ctx.moveTo(point.x, point.y);
                        } else {
                            canvas.ctx.lineTo(point.x, point.y);
                            canvas.ctx.stroke();
                            canvas.ctx.beginPath();
                            canvas.ctx.moveTo(point.x, point.y);
                        }
                    }
                    lastPos = point;
                });
                
                if (lastPos) {
                    canvas.ctx.stroke();
                }
            }

            if (player.isAlive) {
                canvas.ctx.fillStyle = player.headColor;
                if (player.isSquareHead) {
                    const squareSize = player.headRadius * 2;
                    canvas.ctx.fillRect(
                        player.position.x - squareSize/2,
                        player.position.y - squareSize/2,
                        squareSize,
                        squareSize
                    );
                } else {
                    canvas.ctx.beginPath();
                    canvas.ctx.arc(player.position.x, player.position.y, player.headRadius, 0, Math.PI * 2);
                    canvas.ctx.fill();
                }
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
