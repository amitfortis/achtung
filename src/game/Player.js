// src/game/Player.js
export class Player {
   constructor(name, color, leftKey, rightKey, x, y) {
       this.name = name;
       this.color = color;
       this.headColor = 'yellow';
       // Store original state
       this.defaultSpeed = 2;
       this.defaultHeadColor = 'yellow';
       // Controls setup
       this.originalControls = { left: leftKey, right: rightKey };
       this.controls = { ...this.originalControls };
       // Position and movement
       this.position = { x, y };
       this.angle = Math.random() * Math.PI * 2;
       this.speed = this.defaultSpeed;
       // Game state
       this.isAlive = true;
       this.score = 0;
       // Special states
       this.isSquareTurn = false;
       this.isSquareHead = false;
       // Trail settings
       this.trail = [];
       this.gapCounter = 0;
       this.gapInterval = Math.random() * 400 + 200;
       this.gapLength = 12;
       this.isGap = false;
   }

   move() {
       this.gapCounter++;
       if (this.gapCounter >= this.gapInterval) {
           if (!this.isGap) {
              this.trail.push(null);
              this.isGap = true;
           }
           if (this.gapCounter >= this.gapInterval + this.gapLength) {
               this.gapCounter = 0;
               this.isGap = false;
               this.gapInterval = Math.random() * 400 + 200;
           }
       } else if (!this.isGap) {
            this.trail.push({ ...this.position });
       }

       this.position.x += Math.cos(this.angle) * this.speed;
       this.position.y += Math.sin(this.angle) * this.speed;
   }

   turn(direction) {
       if (this.isSquareTurn) {
           // Single 90-degree turn
           this.angle = (this.angle + direction * (Math.PI / 2)) % (Math.PI * 2);
       } else {
           this.angle += direction * 0.05;
       }
   }

   // Track which keys were previously pressed
   lastPressedKeys = {
       left: false,
       right: false
   };

   reset() {
       this.speed = this.defaultSpeed;
       this.headColor = this.defaultHeadColor;
       this.controls = { ...this.originalControls };
       this.isSquareTurn = false;
       this.isSquareHead = false;
       this.lastPressedKeys = {
           left: false,
           right: false
       };
   }
}
