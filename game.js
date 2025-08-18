function startGame() {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  let canvas = document.getElementById('gameCanvas');
  let ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Game Placeholder - Replace images and sounds in assets/', 50, 100);
}
