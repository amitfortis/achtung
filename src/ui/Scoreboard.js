// src/ui/Scoreboard.js
export class Scoreboard {
    constructor() {
        this.scoreboardElement = document.getElementById('scoreboard');
        this.draw = this.draw.bind(this);
    }

    draw(players) {
        const targetScore = (players.length - 1) * 10;
        const scores = players.map(player => 
            `<div style="color: ${player.color}; font-size: 48px; margin: 20px 0;">
                ${player.name}
                <span style="float: right">${player.score}</span>
            </div>`
        ).join('');

        this.scoreboardElement.innerHTML = `
            <div>Race to</div>
            <div style="font-size: 96px; margin: 10px 0;">${targetScore}</div>
            <div style="font-size: 24px;">2 point difference</div>
            ${scores}
            <div class="controls-info">
                SPACE to play<br>
                ESCAPE to quit
            </div>
        `;
    }
}



