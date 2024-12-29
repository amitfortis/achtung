// src/game/Player.js

class ActiveEffect {
    constructor(type, multiplier, duration, powerUpId) {
        this.type = type;
        this.multiplier = multiplier;
        this.expiryTime = Date.now() + duration;
        this.powerUpId = powerUpId;
    }

    isExpired() {
        return Date.now() >= this.expiryTime;
    }

    getRemainingTime() {
        return Math.max(0, this.expiryTime - Date.now());
    }
}

export class Player {
    constructor(name, color, leftKey, rightKey, x, y) {
        this.name = name;
        this.color = color;
        this.headColor = 'yellow';
        this.headOpacity = 1;
        this.defaultSpeed = 2;
        this.defaultHeadRadius = 4;
        this.defaultLineWidth = 8;
        this.defaultHeadColor = 'yellow';
        
        // Controls
        this.controls = { left: leftKey, right: rightKey };
        this.originalControls = { ...this.controls };
        
        // Position and movement
        this.position = { x, y };
        this.angle = Math.random() * Math.PI * 2;
        this.speed = this.defaultSpeed;
        
        // State
        this.isAlive = true;
        this.score = 0;
        this.isSquareTurn = false;
        this.isSquareHead = false;
        this.isInvincible = false;
        this.isBorderWrapEnabled = false;
        
        // Trail management
        this.trail = [];
        this.gapCounter = 0;
        this.gapInterval = Math.random() * 400 + 200;
        this.gapLength = 12;
        this.isGap = false;
        this.currentLineWidth = this.defaultLineWidth;
        this.headRadius = this.defaultHeadRadius;
        
        // Input tracking
        this.lastPressedKeys = {
            left: false,
            right: false
        };
        
        // Trail segments with width history
        this.trailSegments = [{
            startIndex: 0,
            width: this.defaultLineWidth
        }];
        
        // Effect management
        this.speedEffects = [];
        this.widthEffects = [];
        this.otherEffects = new Map();

        // Initialize trail with starting direction indicator
        for (let i = 0; i < 5; i++) {
            this.trail.push({
                x: this.position.x - (Math.cos(this.angle) * i * 5),
                y: this.position.y - (Math.sin(this.angle) * i * 5)
            });
        }
    }

    addEffect(type, multiplier, duration) {
        const powerUpId = `${type}-${Date.now()}-${Math.random()}`;
        const effect = new ActiveEffect(type, multiplier, duration, powerUpId);

        switch (type) {
            case 'speed':
            case 'slow':
                this.speedEffects.push(effect);
                this.updateSpeed();
                break;

            case 'fatLine':
            case 'skinnyLine':
                this.widthEffects.push(effect);
                this.updateLineWidth();
                break;

            case 'squareTurn':
                if (!this.hasEffect('squareTurn')) {
                    this.isSquareTurn = true;
                    this.isSquareHead = true;
                    this.angle = Math.round(this.angle / (Math.PI * 0.5)) * (Math.PI * 0.5);
                }
                if (!this.otherEffects.has(type)) {
                    this.otherEffects.set(type, []);
                }
                this.otherEffects.get(type).push(effect);
                break;

            case 'swap':
                if (!this.otherEffects.has(type)) {
                    this.otherEffects.set(type, []);
                }
                this.otherEffects.get(type).push(effect);
                this.swapControls();
                this.headColor = '#0000FF';
                break;

            case 'invincible':
                if (!this.otherEffects.has(type)) {
                    this.otherEffects.set(type, []);
                }
                this.otherEffects.get(type).push(effect);
                this.isInvincible = true;
                break;

            case 'borderWrap':
                if (!this.otherEffects.has(type)) {
                    this.otherEffects.set(type, []);
                }
                this.otherEffects.get(type).push(effect);
                this.isBorderWrapEnabled = true;
                break;

            default:
                if (!this.otherEffects.has(type)) {
                    this.otherEffects.set(type, []);
                }
                this.otherEffects.get(type).push(effect);
                break;
        }

        return powerUpId;
    }

    updateSpeed() {
        let multiplier = 1;
        this.speedEffects = this.speedEffects.filter(effect => !effect.isExpired());
        
        for (const effect of this.speedEffects) {
            if (effect.type === 'speed') {
                multiplier *= 2;
            } else if (effect.type === 'slow') {
                multiplier *= 0.5;
            }
        }
        
        this.speed = this.defaultSpeed * multiplier;
    }

    updateLineWidth() {
        let multiplier = 1;
        this.widthEffects = this.widthEffects.filter(effect => !effect.isExpired());
        
        for (const effect of this.widthEffects) {
            if (effect.type === 'fatLine') {
                multiplier *= 2;
            } else if (effect.type === 'skinnyLine') {
                multiplier *= 0.5;
            }
        }
        
        const newWidth = this.defaultLineWidth * multiplier;
        if (newWidth !== this.currentLineWidth) {
            this.currentLineWidth = newWidth;
            this.headRadius = this.defaultHeadRadius * multiplier;
            
            // Add new trail segment with current width
            if (this.trail.length > 0) {
                this.trailSegments.push({
                    startIndex: this.trail.length - 1,
                    width: this.currentLineWidth
                });
            }
        }
    }

    updateEffects() {
        this.updateSpeed();
        this.updateLineWidth();
        
        // Update other effects
        for (const [type, effects] of this.otherEffects.entries()) {
            this.otherEffects.set(type, effects.filter(effect => !effect.isExpired()));
            if (this.otherEffects.get(type).length === 0) {
                this.handleEffectExpiration(type);
                this.otherEffects.delete(type);
            }
        }
    }

    handleEffectExpiration(type) {
        switch (type) {
            case 'swap':
                if (!this.hasEffect('swap')) {
                    this.swapControls();
                    this.headColor = this.defaultHeadColor;
                }
                break;
            case 'squareTurn':
                if (!this.hasEffect('squareTurn')) {
                    this.isSquareTurn = false;
                    this.isSquareHead = false;
                }
                break;
            case 'invincible':
                if (!this.hasEffect('invincible')) {
                    this.isInvincible = false;
                    this.addTrailGap();
                }
                break;
            case 'borderWrap':
                if (!this.hasEffect('borderWrap')) {
                    this.isBorderWrapEnabled = false;
                }
                break;
        }
    }

    hasEffect(type) {
        switch (type) {
            case 'speed':
            case 'slow':
                return this.speedEffects.some(effect => effect.type === type && !effect.isExpired());
            case 'fatLine':
            case 'skinnyLine':
                return this.widthEffects.some(effect => effect.type === type && !effect.isExpired());
            default:
                return this.otherEffects.has(type) && 
                       this.otherEffects.get(type).some(effect => !effect.isExpired());
        }
    }

    swapControls() {
        const temp = this.controls.left;
        this.controls.left = this.controls.right;
        this.controls.right = temp;
    }

    addTrailGap() {
        this.trail.push(null);
        if (this.trail.length > 0) {
            this.trailSegments.push({
                startIndex: this.trail.length,
                width: this.currentLineWidth
            });
        }
    }

    addTrailPoint() {
        const lastPoint = this.trail[this.trail.length - 1];
        if (lastPoint) {
            const dx = Math.abs(this.position.x - lastPoint.x);
            const dy = Math.abs(this.position.y - lastPoint.y);
            if (dx > 100 || dy > 100) {
                this.addTrailGap();
                return;
            }
        }
        this.trail.push({ ...this.position });
    }

    updateHeadOpacity() {
        if (this.isBorderWrapEnabled) {
            this.headOpacity = 0.3 + Math.abs(Math.sin(Date.now() / 500)) * 0.7;
        } else {
            this.headOpacity = 1;
        }
    }

    move() {
        this.updateEffects();
        
        this.gapCounter++;
        if (this.gapCounter >= this.gapInterval) {
            if (!this.isGap && !this.isInvincible) {
                this.addTrailGap();
                this.isGap = true;
            }
            if (this.gapCounter >= this.gapInterval + this.gapLength) {
                this.gapCounter = 0;
                this.isGap = false;
                this.gapInterval = Math.random() * 400 + 200;
            }
        } else if (!this.isGap && !this.isInvincible) {
            this.addTrailPoint();
        }

        this.position.x += Math.cos(this.angle) * this.speed;
        this.position.y += Math.sin(this.angle) * this.speed;
    }

    turn(direction) {
        if (this.isSquareTurn) {
            // Snap to 90-degree angles
            this.angle = ((Math.round(this.angle / (Math.PI * 0.5)) + direction) * Math.PI * 0.5) % (Math.PI * 2);
            if (this.angle < 0) this.angle += Math.PI * 2;
        } else {
            this.angle += direction * 0.05;
        }
    }

    getCurrentCollisionRadius() {
        return this.headRadius;
    }

    reset() {
        this.speed = this.defaultSpeed;
        this.headColor = this.defaultHeadColor;
        this.headOpacity = 1;
        this.controls = { ...this.originalControls };
        this.currentLineWidth = this.defaultLineWidth;
        this.headRadius = this.defaultHeadRadius;
        
        // Reset all states
        this.isSquareTurn = false;
        this.isSquareHead = false;
        this.isInvincible = false;
        this.isBorderWrapEnabled = false;
        
        // Clear all effects
        this.speedEffects = [];
        this.widthEffects = [];
        this.otherEffects.clear();
        
        // Reset trail with initial direction indicator
        this.trail = [];
        for (let i = 0; i < 5; i++) {
            this.trail.push({
                x: this.position.x - (Math.cos(this.angle) * i * 5),
                y: this.position.y - (Math.sin(this.angle) * i * 5)
            });
        }
        
        this.trailSegments = [{
            startIndex: 0,
            width: this.defaultLineWidth
        }];
        
        // Reset input tracking
        this.lastPressedKeys = {
            left: false,
            right: false
        };
        
        // Reset gap-related properties
        this.gapCounter = 0;
        this.isGap = false;
        this.gapInterval = Math.random() * 400 + 200;
    }

    resetEffects() {
        this.speed = this.defaultSpeed;
        this.headColor = this.defaultHeadColor;
        this.headOpacity = 1;
        this.isBorderWrapEnabled = false;
        this.isInvincible = false;
        this.isSquareTurn = false;
        this.isSquareHead = false;
        this.currentLineWidth = this.defaultLineWidth;
        this.headRadius = this.defaultHeadRadius;
        
        // Clear all effects
        this.speedEffects = [];
        this.widthEffects = [];
        this.otherEffects.clear();
    }
}
