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
    }

    move() {
        this.trail.push({ ...this.position });
        this.position.x += Math.cos(this.angle) * this.speed;
        this.position.y += Math.sin(this.angle) * this.speed;
    }

    turn(direction) {
        this.angle += direction * 0.1;
    }
}
