// src/game/PowerUp.js
export class PowerUp {
    static TYPES = {
        CLEAR: 'clear',
        SPEED: 'speed',
        SWAP: 'swap',
        SQUARE_TURN: 'squareTurn',
        SLOW: 'slow',
        SPAWN_BOOST: 'spawnBoost',
        SKINNY_LINE: 'skinnyLine',
        FAT_LINE: 'fatLine',
        INVINCIBLE: 'invincible',
        RANDOM: 'random',
        BORDER_WRAP: 'borderWrap'
    };

   
constructor(canvas, type) {
    this.canvas = canvas;
    this.type = type;
    this.position = this.getRandomPosition();
    this.radius = 25;
    this.innerRadius = 20;
    this.color = this.getColor();
    this.collected = false;
    this.duration = Math.random() * 5000 + 5000; // 5-10 seconds
    this.collector = null;
    this.powerUpId = `${type}-${Date.now()}-${Math.random()}`; // Add unique ID
    this.affectedPlayers = new Set();
    this.multiplier = this.getMultiplier(); // Add multiplier property
}

    getMultiplier() {
    switch(this.type) {
        case PowerUp.TYPES.SPEED:
            return this.color === '#FF0000' ? 2 : 0.5;
        case PowerUp.TYPES.SLOW:
            return this.color === '#FF0000' ? 0.5 : 2;
        case PowerUp.TYPES.FAT_LINE:
            return 2;
        case PowerUp.TYPES.SKINNY_LINE:
            return 0.5;
        default:
            return 1;
    }
}

    getRandomPosition() {
        const padding = 50;
        return {
            x: Math.random() * (this.canvas.canvas.width - 2 * padding) + padding,
            y: Math.random() * (this.canvas.canvas.height - 2 * padding) + padding
        };
    }

    getColor() {
        switch(this.type) {
            case PowerUp.TYPES.CLEAR:
            case PowerUp.TYPES.SPAWN_BOOST:
                return '#0000FF';
            case PowerUp.TYPES.RANDOM:
                return '#6A0DAD'; // Purple
            case PowerUp.TYPES.FAT_LINE:
                return '#FF0000';
            case PowerUp.TYPES.SKINNY_LINE:
            case PowerUp.TYPES.INVINCIBLE:
                return '#00FF00';
            case PowerUp.TYPES.SPEED:
            case PowerUp.TYPES.SQUARE_TURN:
            case PowerUp.TYPES.SLOW:
                return Math.random() < 0.5 ? '#FF0000' : '#00FF00';
            case PowerUp.TYPES.SWAP:
                return '#FF0000';
            default:
                return '#FFFFFF';
            case PowerUp.TYPES.BORDER_WRAP:
                return Math.random() < 0.5 ? '#0000FF' : '#00FF00';
        }
    }

    draw(ctx) {
        if (this.collected) return;

        // Draw outer circle
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Draw icon
        ctx.fillStyle = 'white';
        switch(this.type) {
            case PowerUp.TYPES.RANDOM:
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', this.position.x, this.position.y);
                break;
            case PowerUp.TYPES.INVINCIBLE:
                ctx.beginPath();
                const starPoints = 5;
                const outerRadius = 10;
                const innerRadius = 4;
                for(let i = 0; i < starPoints * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / starPoints;
                    const x = this.position.x + Math.cos(angle) * radius;
                    const y = this.position.y + Math.sin(angle) * radius;
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
            // Existing cases remain the same
            case PowerUp.TYPES.CLEAR:
                const squareSize = 15;
                ctx.fillRect(
                    this.position.x - squareSize / 2,
                    this.position.y - squareSize / 2,
                    squareSize,
                    squareSize
                );
                break;
            case PowerUp.TYPES.SPEED:
                ctx.beginPath();
                ctx.moveTo(this.position.x - 7, this.position.y - 10);
                ctx.lineTo(this.position.x + 3, this.position.y - 3);
                ctx.lineTo(this.position.x - 3, this.position.y + 3);
                ctx.lineTo(this.position.x + 7, this.position.y + 10);
                ctx.fill();
                break;
            case PowerUp.TYPES.SWAP:
                ctx.beginPath();
                ctx.moveTo(this.position.x - 10, this.position.y);
                ctx.lineTo(this.position.x - 5, this.position.y - 5);
                ctx.lineTo(this.position.x - 5, this.position.y + 5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.position.x + 10, this.position.y);
                ctx.lineTo(this.position.x + 5, this.position.y - 5);
                ctx.lineTo(this.position.x + 5, this.position.y + 5);
                ctx.fill();
                break;
            case PowerUp.TYPES.SQUARE_TURN:
                ctx.beginPath();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.moveTo(this.position.x - 2, this.position.y - 8);
                ctx.lineTo(this.position.x - 2, this.position.y + 8);
                ctx.lineTo(this.position.x + 8, this.position.y + 8);
                ctx.stroke();
                break;
            case PowerUp.TYPES.SLOW:
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'white';
                ctx.moveTo(this.position.x - 7, this.position.y - 7);
                ctx.lineTo(this.position.x + 7, this.position.y - 7);
                ctx.lineTo(this.position.x - 7, this.position.y + 7);
                ctx.lineTo(this.position.x + 7, this.position.y + 7);
                ctx.stroke();
                break;
            case PowerUp.TYPES.SPAWN_BOOST:
                const radius = 4;
                const offset = 6;
                [
                    [0, -offset],
                    [-offset, offset/2],
                    [offset, offset/2]
                ].forEach(([dx, dy]) => {
                    ctx.beginPath();
                    ctx.arc(this.position.x + dx, this.position.y + dy, radius, 0, Math.PI * 2);
                    ctx.fill();
                });
                break;
            case PowerUp.TYPES.SKINNY_LINE:
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'white';
                ctx.moveTo(this.position.x - 2, this.position.y - 8);
                ctx.lineTo(this.position.x - 2, this.position.y + 8);
                ctx.stroke();
                break;
            case PowerUp.TYPES.FAT_LINE:
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.strokeStyle = 'white';
                ctx.moveTo(this.position.x, this.position.y - 8);
                ctx.lineTo(this.position.x, this.position.y + 8);
                ctx.stroke();
                break;
            case PowerUp.TYPES.BORDER_WRAP:
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, 8, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.stroke();
                ctx.setLineDash([]);
                break;
        }
    }

    checkCollision(player) {
        if (this.collected) return false;
        const dx = this.position.x - player.position.x;
        const dy = this.position.y - player.position.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    swapControls(player) {
        const temp = player.controls.left;
        player.controls.left = player.controls.right;
        player.controls.right = temp;
    }

   apply(gameState, collector) {
    this.collector = collector;
    this.collected = true;
    this.collectedTime = Date.now();

    if (this.type === PowerUp.TYPES.RANDOM) {
        const types = Object.values(PowerUp.TYPES).filter(type => type !== PowerUp.TYPES.RANDOM);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomPowerup = new PowerUp(this.canvas, randomType);
        randomPowerup.position = this.position;
        randomPowerup.apply(gameState, collector);
        return;
    }

    switch(this.type) {
        case PowerUp.TYPES.CLEAR:
            gameState.players.forEach(player => {
                player.trail = [];
                player.trailSegments = [{
                    startIndex: 0,
                    width: player.currentLineWidth
                }];
            });
            break;

        case PowerUp.TYPES.SPEED:
        case PowerUp.TYPES.SLOW:
            const isRedEffect = this.color === '#FF0000';
            gameState.players.forEach(player => {
                if ((isRedEffect && player !== collector) || (!isRedEffect && player === collector)) {
                    player.addEffect(this.type, this.multiplier, this.duration);
                    this.affectedPlayers.add(player);
                }
            });
            break;

        case PowerUp.TYPES.SWAP:
            gameState.players.forEach(player => {
                if (player !== collector) {
                    player.addEffect('swap', 1, this.duration);
                    player.headColor = '#0000FF';
                    this.affectedPlayers.add(player);
                }
            });
            break;

        case PowerUp.TYPES.SQUARE_TURN:
            const isSquareRed = this.color === '#FF0000';
            gameState.players.forEach(player => {
                if ((isSquareRed && player !== collector) || (!isSquareRed && player === collector)) {
                    player.addEffect('squareTurn', 1, this.duration);
                    // Immediately apply square turn effects
                    player.isSquareTurn = true;
                    player.isSquareHead = true;
                    // Snap to nearest 90-degree angle
                    player.angle = Math.round(player.angle / (Math.PI * 0.5)) * (Math.PI * 0.5);
                    this.affectedPlayers.add(player);
                }
            });
            break;

        case PowerUp.TYPES.SPAWN_BOOST:
            const boostDuration = 3000;
            const originalSpawnRate = gameState.baseSpawnRate;
            gameState.spawnRate = 0.025;
            
            // Add to player's active effects
            collector.addEffect('spawnBoost', 1, boostDuration);
            this.affectedPlayers.add(collector);
            
            // Handle effect expiration
            setTimeout(() => {
                const spawnEffects = collector.otherEffects.get('spawnBoost') || [];
                collector.otherEffects.set('spawnBoost', 
                    spawnEffects.filter(effect => effect.powerUpId !== this.powerUpId)
                );
                
                // Only reset spawn rate if no other spawn boost effects are active
                if (!collector.hasEffect('spawnBoost')) {
                    gameState.spawnRate = originalSpawnRate;
                }
            }, boostDuration);
            break;

        case PowerUp.TYPES.SKINNY_LINE:
            collector.addEffect('skinnyLine', 0.5, this.duration);
            this.affectedPlayers.add(collector);
            break;
        case PowerUp.TYPES.FAT_LINE:
            gameState.players.forEach(player => {
                if (player !== collector) {
                    player.addEffect('fatLine', this.multiplier, this.duration);
                    this.affectedPlayers.add(player);
                }
            });
            break;

        case PowerUp.TYPES.INVINCIBLE:
            collector.addEffect('invincible', 1, this.duration);
            collector.isInvincible = true;
            this.affectedPlayers.add(collector);
            break;

        case PowerUp.TYPES.BORDER_WRAP:
            if (this.color === '#0000FF') {
                gameState.isBorderWrapActive = true;
                gameState.players.forEach(player => {
                    player.addEffect('borderWrap', 1, this.duration);
                    player.isBorderWrapEnabled = true;
                    this.affectedPlayers.add(player);
                });
            } else {
                collector.addEffect('borderWrap', 1, this.duration);
                collector.isBorderWrapEnabled = true;
                this.affectedPlayers.add(collector);
            }
            break;
    }
}

  update(gameState) {
    if (!this.collected) return false;

    // Check if the duration has expired
    if (Date.now() - this.collectedTime >= this.duration) {
        this.affectedPlayers.forEach(player => {
            switch(this.type) {
                case PowerUp.TYPES.SPEED:
                    player.speedEffects = player.speedEffects.filter(effect => 
                        effect.powerUpId !== this.powerUpId
                    );
                    player.updateSpeed();
                    break;

                case PowerUp.TYPES.SLOW:
                    player.speedEffects = player.speedEffects.filter(effect => 
                        effect.powerUpId !== this.powerUpId
                    );
                    player.updateSpeed();
                    break;

                case PowerUp.TYPES.SWAP:
                    const swapEffects = player.otherEffects.get('swap') || [];
                    player.otherEffects.set('swap', 
                        swapEffects.filter(effect => effect.powerUpId !== this.powerUpId)
                    );
                    if (!player.hasEffect('swap')) {
                        player.swapControls();
                        player.headColor = 'yellow';
                    }
                    break;

                case PowerUp.TYPES.SQUARE_TURN:
                    const squareEffects = player.otherEffects.get('squareTurn') || [];
                    player.otherEffects.set('squareTurn', 
                        squareEffects.filter(effect => effect.powerUpId !== this.powerUpId)
                    );
                    if (!player.hasEffect('squareTurn')) {
                        player.isSquareTurn = false;
                        player.isSquareHead = false;
                    }
                    break;

                case PowerUp.TYPES.SKINNY_LINE:
                    player.widthEffects = player.widthEffects.filter(effect => 
                        effect.powerUpId !== this.powerUpId
                    );
                    player.updateLineWidth();
                    break;

                case PowerUp.TYPES.FAT_LINE:
                    player.widthEffects = player.widthEffects.filter(effect => 
                        effect.powerUpId !== this.powerUpId
                    );
                    player.updateLineWidth();
                    break;

                case PowerUp.TYPES.INVINCIBLE:
                    const invincibleEffects = player.otherEffects.get('invincible') || [];
                    player.otherEffects.set('invincible', 
                        invincibleEffects.filter(effect => effect.powerUpId !== this.powerUpId)
                    );
                    if (!player.hasEffect('invincible')) {
                        player.isInvincible = false;
                        player.addTrailGap();
                    }
                    break;

                case PowerUp.TYPES.BORDER_WRAP:
                    const wrapEffects = player.otherEffects.get('borderWrap') || [];
                    player.otherEffects.set('borderWrap', 
                        wrapEffects.filter(effect => effect.powerUpId !== this.powerUpId)
                    );
                    if (!player.hasEffect('borderWrap')) {
                        player.isBorderWrapEnabled = false;
                    }
                    if (this.color === '#0000FF') {
                        gameState.isBorderWrapActive = false;
                    }
                    break;
            }
        });
        return true;
    }
    return false;
}
    static spawnPowerUp(canvas) {
        if (Math.random() < 0.005) {
            const types = Object.values(PowerUp.TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            return new PowerUp(canvas, type);
        }
        return null;
    }
}



