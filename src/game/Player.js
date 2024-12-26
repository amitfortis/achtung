// src/game/Player.js
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
      this.controls = { left: leftKey, right: rightKey };
      this.originalControls = { ...this.controls };
      this.position = { x, y };
      this.angle = Math.random() * Math.PI * 2;
      this.speed = this.defaultSpeed;
      this.isAlive = true;
      this.score = 0;
      this.isSquareTurn = false;
      this.isSquareHead = false;
      this.isInvincible = false;
      this.isBorderWrapEnabled = false;
      this.trail = [];
      this.gapCounter = 0;
      this.gapInterval = Math.random() * 400 + 200;
      this.gapLength = 12;
      this.isGap = false;
      this.currentLineWidth = this.defaultLineWidth;
      this.headRadius = this.defaultHeadRadius;
      this.lastPressedKeys = {
          left: false,
          right: false
      };
      this.trailSegments = [{
          startIndex: 0,
          width: this.defaultLineWidth
      }];
      this.activeEffects = new Map();
  }

  addEffect(type) {
      const count = this.activeEffects.get(type) || 0;
      this.activeEffects.set(type, count + 1);
  }

  removeEffect(type) {
      const count = this.activeEffects.get(type) || 0;
      if (count > 0) {
          this.activeEffects.set(type, count - 1);
          if (count === 1) {
              this.activeEffects.delete(type);
          }
      }
  }

  hasEffect(type) {
      return this.activeEffects.get(type) > 0;
  }

  addTrailGap() {
      this.trail.push(null);
      this.trailSegments.push({
          startIndex: this.trail.length,
          width: this.currentLineWidth
      });
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
      if (this.trailSegments.length === 0 ||
          this.trail.length - 1 === this.trailSegments[this.trailSegments.length - 1].startIndex) {
          this.trailSegments.push({
              startIndex: this.trail.length - 1,
              width: this.currentLineWidth
          });
      }
  }

  updateHeadOpacity() {
      if (this.isBorderWrapEnabled) {
          this.headOpacity = 0.3 + Math.abs(Math.sin(Date.now() / 500)) * 0.7;
      } else {
          this.headOpacity = 1;
      }
  }

  move() {
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
          this.angle = (this.angle + direction * (Math.PI / 2)) % (Math.PI * 2);
      } else {
          this.angle += direction * 0.05;
      }
  }

  reset() {
      this.speed = this.defaultSpeed;
      this.headColor = this.defaultHeadColor;
      this.headOpacity = 1;
      this.controls = { ...this.originalControls };
      this.isSquareTurn = false;
      this.isSquareHead = false;
      this.isInvincible = false;
      this.isBorderWrapEnabled = false;
      this.currentLineWidth = this.defaultLineWidth;
      this.headRadius = this.defaultHeadRadius;
      this.trailSegments = [{
          startIndex: 0,
          width: this.defaultLineWidth
      }];
      this.lastPressedKeys = {
          left: false,
          right: false
      };
      this.gapCounter = 0;
      this.isGap = false;
      this.activeEffects.clear();
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
      this.activeEffects.clear();
  }
}
