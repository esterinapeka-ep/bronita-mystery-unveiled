// game.js

let canvas, ctx;
let currentScene = 1;
let totalScenes = 25;
let bgImage = new Image();
let collectibles = [];
let collected = 0;

let bgMusic = null;
let musicMap = {
  1: "assets/sounds/castle_night.mp3",
  6: "assets/sounds/dark_forest.mp3",
  11: "assets/sounds/forest_night.mp3",
  16: "assets/sounds/night_lands_magic.mp3",
  21: "assets/sounds/final_glow.mp3"
};
let successChime = new Audio("assets/sounds/success_chime.mp3");

// Characters
let bronitaImg = loadImage("assets/images/bronita.png");
let luceoImg = loadImage("assets/images/luceo.png");
let lemonaImg = loadImage("assets/images/lemona.png");
let deprimioImg = loadImage("assets/images/deprimio.png");
let hourglassImg = loadImage("assets/images/hourglass.png");

//Collectibles
let fireflyImg = loadImage("assets/images/firefly.png");
let snowflakeImg = loadImage("assets/images/snowflake.png");

// Deprimio
let deprimio = {x: 0, y: 0, dx: 5, dy: 5, active: false};
let timeLeft = 20;
let timerInterval = null;
let deprimioTimer = 0;
let gameOver = false;
let adsUsed = false;

// Floating text effects
let floatingTexts = [];

// --- START GAME ---
function startGame() {
  console.log("Start Game button clicked!");
  
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  playMusicForScene(currentScene);
  loadScene(currentScene);

  canvas.addEventListener("click", checkCollectibleClick);
  canvas.addEventListener("click", checkHourglassClick);
}

function loadScene(sceneNumber) {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = 20;
  deprimio.active = false;
  deprimioTimer = 0;
  adsUsed = false;

  bgImage.src = `assets/images/scene${sceneNumber}.jpg`;
  bgImage.onload = function() {
    collectibles = [];
    spawnCollectibles(10); // spawn at least 10 collectibles
    drawScene();

    // Countdown timer
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
      } else {
        if (!deprimio.active) {
          deprimio.active = true;
          deprimio.x = 0;
          deprimio.y = 0;
          deprimioTimer = 20;
        }
      }
    }, 1000);
  };
}

function spawnCollectibles(minimum = 10) {
  const collectibleTypes = ["firefly", "snowflake"];

  for (let i = 0; i < minimum; i++) {
    let type = collectibleTypes[i % collectibleTypes.length];
    collectibles.push({
      type,
      img: loadImage(`assets/images/${type}.png`),
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 50),
      size: 50,  // bigger size (50px)
      found: false
    });
  }
}

function loadImage(src) {
  let img = new Image();
  img.src = src;
  return img;
}

function drawScene() {
  if (gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(deprimioImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Character by scene
  let charImg = null;
  if (currentScene >= 1 && currentScene <= 3) charImg = bronitaImg;
  else if (currentScene >= 4 && currentScene <= 14) charImg = luceoImg;
  else if (currentScene >= 15 && currentScene <= 19) charImg = bronitaImg;
  else if (currentScene >= 20 && currentScene <= 25) charImg = lemonaImg;

  if (charImg) {
    ctx.drawImage(charImg, canvas.width - 250, canvas.height - 400, 200, 300);
  }

  // Collectibles
  collectibles.forEach(c => {
    if (!c.found) ctx.drawImage(c.img, c.x, c.y, c.size, c.size);
  });

  // Floating texts
  floatingTexts.forEach((ft, index) => {
    ctx.fillStyle = `rgba(255, 255, 0, ${ft.alpha})`; // yellow
    ctx.font = "20px Arial";
    ctx.fillText(ft.text, ft.x, ft.y);

    // Animate upward and fade
    ft.y -= 1;
    ft.alpha -= 0.02;

    // Remove when invisible
    if (ft.alpha <= 0) {
      floatingTexts.splice(index, 1);
    }
  });

  // Deprimio active
  if (deprimio.active) {
    ctx.drawImage(deprimioImg, deprimio.x, deprimio.y, 150, 200);
    deprimio.x += deprimio.dx;
    deprimio.y += deprimio.dy;

    if (deprimio.x <= 0 || deprimio.x + 150 >= canvas.width) deprimio.dx *= -1;
    if (deprimio.y <= 0 || deprimio.y + 200 >= canvas.height) deprimio.dy *= -1;

    if (deprimioTimer > 0) {
      deprimioTimer -= 0.02;
    } else {
      gameOver = true;
    }
  }

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Scene ${currentScene} / ${totalScenes}`, 20, 30);
  ctx.fillText(`Collected: ${collected}`, 20, 60);
  if (!deprimio.active) {
    ctx.fillText(`Time left: ${timeLeft}`, 20, 90);
  } else {
    ctx.fillStyle = "red";
    ctx.fillText(`Deprimio takeover!`, 20, 90);
  }

  // Hourglass icon if not used
  if (!adsUsed) {
    ctx.drawImage(hourglassImg, canvas.width - 80, 20, 50, 50);
  }

  requestAnimationFrame(drawScene);
}

function checkCollectibleClick(e) {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  collectibles.forEach(c => {
    if (!c.found) {
      // Circle hitbox detection
      let dx = mouseX - (c.x + c.size / 2);
      let dy = mouseY - (c.y + c.size / 2);
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < c.size / 2) {
        c.found = true;
        collected++;

        // Play chime sound
        successChime.play();

        // Add floating +1 effect
        floatingTexts.push({
          text: "+1",
          x: c.x,
          y: c.y,
          alpha: 1.0
        });

        if (collectibles.every(c => c.found)) {
          deprimio.active = false;
          clearInterval(timerInterval);
          setTimeout(nextScene, 1000);
        }
      }
    }
  });
}

function checkHourglassClick(e) {
  if (gameOver || adsUsed) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (!adsUsed &&
      mouseX >= canvas.width - 80 && mouseX <= canvas.width - 30 &&
      mouseY >= 20 && mouseY <= 70) {
    prolongTime();
  }
}

function prolongTime() {
  if (gameOver || adsUsed) return;

  if (!deprimio.active) {
    timeLeft += 20;
  } else {
    deprimioTimer += 20;
  }

  adsUsed = true;
}

function nextScene() {
  if (currentScene < totalScenes) {
    currentScene++;
    playMusicForScene(currentScene);
    loadScene(currentScene);
  } else {
    endGame();
  }
}

function playMusicForScene(scene) {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  let track = null;
  for (let startScene in musicMap) {
    if (scene >= startScene) {
      track = musicMap[startScene];
    }
  }

  if (track) {
    bgMusic = new Audio(track);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play();
  }
}

function endGame() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  successChime.play();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "forestgreen";
  ctx.font = "40px Arial";
  ctx.fillText("Congratulations! You finished the game!", 50, canvas.height / 2);
}
// game.js

let canvas, ctx;
let currentScene = 1;
let totalScenes = 25;
let bgImage = new Image();
let collectibles = [];
let collected = 0;

let bgMusic = null;
let musicMap = {
  1: "assets/sounds/castle_night.mp3",
  6: "assets/sounds/dark_forest.mp3",
  11: "assets/sounds/forest_night.mp3",
  16: "assets/sounds/night_lands_magic.mp3",
  21: "assets/sounds/final_glow.mp3"
};
let successChime = new Audio("assets/sounds/success_chime.mp3");

// Characters
let bronitaImg = loadImage("assets/images/bronita.png");
let luceoImg = loadImage("assets/images/luceo.png");
let lemonaImg = loadImage("assets/images/lemona.png");
let deprimioImg = loadImage("assets/images/deprimio.png");
let hourglassImg = loadImage("assets/images/hourglass.png");

// Deprimio
let deprimio = {x: 0, y: 0, dx: 5, dy: 5, active: false};
let timeLeft = 20;
let timerInterval = null;
let deprimioTimer = 0;
let gameOver = false;
let adsUsed = false;

// Floating text effects
let floatingTexts = [];

// --- START GAME ---
function startGame() {
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';

  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  playMusicForScene(currentScene);
  loadScene(currentScene);

  canvas.addEventListener("click", checkCollectibleClick);
  canvas.addEventListener("click", checkHourglassClick);
}

function loadScene(sceneNumber) {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = 20;
  deprimio.active = false;
  deprimioTimer = 0;
  adsUsed = false;

  bgImage.src = `assets/images/scene${sceneNumber}.jpg`;
  bgImage.onload = function() {
    collectibles = [];
    spawnCollectibles(10); // spawn at least 10 collectibles
    drawScene();

    // Countdown timer
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
      } else {
        if (!deprimio.active) {
          deprimio.active = true;
          deprimio.x = 0;
          deprimio.y = 0;
          deprimioTimer = 20;
        }
      }
    }, 1000);
  };
}

function spawnCollectibles(minimum = 10) {
  const collectibleTypes = ["firefly", "snowflake"];

  for (let i = 0; i < minimum; i++) {
    let type = collectibleTypes[i % collectibleTypes.length];
    collectibles.push({
      type,
      img: loadImage(`assets/images/${type}.png`),
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 50),
      size: 50,  // bigger size (50px)
      found: false
    });
  }
}

function loadImage(src) {
  let img = new Image();
  img.src = src;
  return img;
}

function drawScene() {
  if (gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(deprimioImg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Character by scene
  let charImg = null;
  if (currentScene >= 1 && currentScene <= 3) charImg = bronitaImg;
  else if (currentScene >= 4 && currentScene <= 14) charImg = luceoImg;
  else if (currentScene >= 15 && currentScene <= 19) charImg = bronitaImg;
  else if (currentScene >= 20 && currentScene <= 25) charImg = lemonaImg;

  if (charImg) {
    ctx.drawImage(charImg, canvas.width - 250, canvas.height - 400, 200, 300);
  }

  // Collectibles
  collectibles.forEach(c => {
    if (!c.found) ctx.drawImage(c.img, c.x, c.y, c.size, c.size);
  });

  // Floating texts
  floatingTexts.forEach((ft, index) => {
    ctx.fillStyle = `rgba(255, 255, 0, ${ft.alpha})`; // yellow
    ctx.font = "20px Arial";
    ctx.fillText(ft.text, ft.x, ft.y);

    // Animate upward and fade
    ft.y -= 1;
    ft.alpha -= 0.02;

    // Remove when invisible
    if (ft.alpha <= 0) {
      floatingTexts.splice(index, 1);
    }
  });

  // Deprimio active
  if (deprimio.active) {
    ctx.drawImage(deprimioImg, deprimio.x, deprimio.y, 150, 200);
    deprimio.x += deprimio.dx;
    deprimio.y += deprimio.dy;

    if (deprimio.x <= 0 || deprimio.x + 150 >= canvas.width) deprimio.dx *= -1;
    if (deprimio.y <= 0 || deprimio.y + 200 >= canvas.height) deprimio.dy *= -1;

    if (deprimioTimer > 0) {
      deprimioTimer -= 0.02;
    } else {
      gameOver = true;
    }
  }

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Scene ${currentScene} / ${totalScenes}`, 20, 30);
  ctx.fillText(`Collected: ${collected}`, 20, 60);
  if (!deprimio.active) {
    ctx.fillText(`Time left: ${timeLeft}`, 20, 90);
  } else {
    ctx.fillStyle = "red";
    ctx.fillText(`Deprimio takeover!`, 20, 90);
  }

  // Hourglass icon if not used
  if (!adsUsed) {
    ctx.drawImage(hourglassImg, canvas.width - 80, 20, 50, 50);
  }

  requestAnimationFrame(drawScene);
}

function checkCollectibleClick(e) {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  collectibles.forEach(c => {
    if (!c.found) {
      // Circle hitbox detection
      let dx = mouseX - (c.x + c.size / 2);
      let dy = mouseY - (c.y + c.size / 2);
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < c.size / 2) {
        c.found = true;
        collected++;

        // Play chime sound
        successChime.play();

        // Add floating +1 effect
        floatingTexts.push({
          text: "+1",
          x: c.x,
          y: c.y,
          alpha: 1.0
        });

        if (collectibles.every(c => c.found)) {
          deprimio.active = false;
          clearInterval(timerInterval);
          setTimeout(nextScene, 1000);
        }
      }
    }
  });
}

function checkHourglassClick(e) {
  if (gameOver || adsUsed) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (!adsUsed &&
      mouseX >= canvas.width - 80 && mouseX <= canvas.width - 30 &&
      mouseY >= 20 && mouseY <= 70) {
    prolongTime();
  }
}

function prolongTime() {
  if (gameOver || adsUsed) return;

  if (!deprimio.active) {
    timeLeft += 20;
  } else {
    deprimioTimer += 20;
  }

  adsUsed = true;
}

function nextScene() {
  if (currentScene < totalScenes) {
    currentScene++;
    playMusicForScene(currentScene);
    loadScene(currentScene);
  } else {
    endGame();
  }
}

function playMusicForScene(scene) {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  let track = null;
  for (let startScene in musicMap) {
    if (scene >= startScene) {
      track = musicMap[startScene];
    }
  }

  if (track) {
    bgMusic = new Audio(track);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play();
  }
}

function endGame() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  successChime.play();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "forestgreen";
  ctx.font = "40px Arial";
  ctx.fillText("Congratulations! You finished the game!", 50, canvas.height / 2);
}

