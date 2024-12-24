// src/game/Player.js
export class Player {
   constructor(name, color, leftKey, rightKey, x, y) {
       this.name = name;
       this.color = color;
       this.controls = { left: leftKey, right: rightKey };
       this.position = { x, y };
       this.angle = Math.random() * Math.PI * 2;
       this.speed = 2;
       this.isAlive = true;
       this.score = 0;
       this.trail = [];
       this.gapCounter = 0;
       this.gapInterval = Math.random() * 400 + 200; // Frames between gaps
       this.gapLength = 15;   // Frames gap length
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
      this.angle += direction * 0.05;
  }
}
