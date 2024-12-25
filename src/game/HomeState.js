// src/game/HomeState.js
export class HomeState {
   constructor(canvas) {
       this.canvas = canvas;
       this.players = [
           { id: 1, name: 'Fred', color: 'red', left: '', right: '', selected: false },
           { id: 2, name: 'Greenlee', color: '#00FF00', left: '', right: '', selected: false },
           { id: 3, name: 'Pinkney', color: '#FF00FF', left: '', right: '', selected: false },
           { id: 4, name: 'Bluebell', color: 'cyan', left: '', right: '', selected: false },
           { id: 5, name: 'Willem', color: '#FFA500', left: '', right: '', selected: false },
           { id: 6, name: 'Greydon', color: 'grey', left: '', right: '', selected: false }
       ];
       this.selectedPlayer = null;
       this.settingKey = null;
       this.ctx = homeScreen.getContext('2d');
       
       homeScreen.addEventListener('click', this.handleClick.bind(this));
   }

   draw() {
       const ctx = this.ctx;
       const centerX = homeScreen.width / 2;
       const startX = centerX - 400;
       
       ctx.clearRect(0, 0, homeScreen.width, homeScreen.height);
       
       // Title
       ctx.fillStyle = 'yellow';
       ctx.font = 'bold 46px Arial';
       ctx.textAlign = 'center';
       ctx.fillText('Achtung, die Kurve!', centerX, 100);
       
       // Headers
       ctx.textAlign = 'left';
       ctx.font = '35px Arial';
       ctx.fillStyle = '#808080';
       const headerY = 180;
       
       ctx.fillText('#', startX, headerY);
       ctx.fillText('Player', startX + 100, headerY);
       ctx.fillText('Left', startX + 450, headerY);
       ctx.fillText('Right', startX + 650, headerY);
       
       // Players
       const rowHeight = 70;
       this.players.forEach((player, i) => {
           const y = headerY + ((i + 1) * rowHeight);
           ctx.fillStyle = player.color;
           ctx.fillText(player.id, startX, y);
           ctx.fillText(player.name, startX + 100, y);
           ctx.fillText(player.left || ' ', startX + 450, y);
           ctx.fillText(player.right || ' ', startX + 650, y);

           if (this.selectedPlayer === player) {
               const keyX = this.settingKey === 'left' ? startX + 450 : startX + 650;
               ctx.strokeStyle = 'white';
               ctx.strokeRect(keyX - 5, y - 35, 100, 45);
           }
       });

       // Start instruction
       const startY = homeScreen.height - 100;
       ctx.fillStyle = 'white';
       ctx.textAlign = 'center';
       ctx.font = '32px Arial';
       ctx.fillText('Press SPACE to start game', centerX, startY);
   }

   handleClick(event) {
       const rect = homeScreen.getBoundingClientRect();
       const centerX = homeScreen.width / 2;
       const startX = centerX - 400;
       const x = event.clientX - rect.left;
       const y = event.clientY - rect.top;
       
       const headerY = 180;
       const rowHeight = 70;
       
       this.players.forEach((player, i) => {
           const rowY = headerY + ((i + 1) * rowHeight);
           if (y >= rowY - 35 && y <= rowY + 10) {
               if (x >= startX + 100 && x <= startX + 400) {
                   if (this.selectedPlayer === player) {
                      this.selectedPlayer = null;
                      this.settingKey = null;
                      player.left = '';
                      player.right = '';
                   } else {
                       this.selectedPlayer = player;
                       this.settingKey = 'left';
                   }
               } else if (x >= startX + 450 && x <= startX + 550 && this.selectedPlayer === player) {
                   this.settingKey = 'left';
               } else if (x >= startX + 650 && x <= startX + 750 && this.selectedPlayer === player) {
                   this.settingKey = 'right';
               }
           }
       });
   }

   handleKeyPress(key) {
       if (this.selectedPlayer && this.settingKey) {
           if (this.settingKey === 'left') {
               this.selectedPlayer.left = key.toUpperCase();
               this.settingKey = 'right';
           } else {
               this.selectedPlayer.right = key.toUpperCase();
               this.settingKey = null;
               this.selectedPlayer = null;
           }
       }
   }

   getSelectedPlayers() {
       return this.players.filter(p => p.left && p.right);
   }
}
