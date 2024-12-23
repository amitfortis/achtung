// src/main.js
import { Canvas } from './ui/Canvas';
import { Player } from './game/Player';

const canvas = new Canvas();
const players = [
    new Player('Fred', 'red', 'A', 'D', 200, 200),
    new Player('Bluebell', 'cyan', 'N', 'M', 600, 400)
];

function draw() {
    canvas.clear();
    // Draw players
    players.forEach(player => {
        const ctx = canvas.ctx;
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(draw);
}

draw();
