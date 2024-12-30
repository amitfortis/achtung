export class Canvas {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = null;
        this.resize();
    }

    setGameState(gameState) {
        this.gameState = gameState;
    }

    resize() {
        this.canvas.width = 1000;
        this.canvas.height = 800;
    }

   clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw border
    this.ctx.strokeStyle = 'yellow';
    this.ctx.lineWidth = 4;
    if (this.gameState?.borderOpacity > 0) {
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
}}
