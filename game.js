const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start');
const ringsLabel = document.getElementById('rings');
const livesLabel = document.getElementById('lives');
const timerLabel = document.getElementById('timer');

const WORLD = { width: 2500, height: 540, groundY: 500 };
const controls = { left: false, right: false, jump: false };
const state = {
  running: false,
  paused: false,
  finished: false,
  time: 0,
  rings: 0,
  lives: 3,
  cameraX: 0,
  lastTs: 0,
  overlayMode: 'start'
};

const platforms = [
  { x: 0, y: 500, w: 2500, h: 60, solid: true },
  { x: 260, y: 390, w: 180, h: 18, solid: true },
  { x: 540, y: 330, w: 150, h: 18, solid: true },
  { x: 860, y: 280, w: 200, h: 18, solid: true },
  { x: 1160, y: 345, w: 180, h: 18, solid: true },
  { x: 1460, y: 260, w: 170, h: 18, solid: true },
  { x: 1760, y: 360, w: 170, h: 18, solid: true },
  { x: 2060, y: 300, w: 180, h: 18, solid: true },
  { x: 2240, y: 360, w: 150, h: 18, solid: true }
];

const player = {
  x: 90,
  y: 370,
  w: 28,
  h: 42,
  vx: 0,
  vy: 0,
  speed: 330,
  jumpForce: 620,
  onGround: false,
  facing: 1,
  invulnerable: 0,
  coyote: 0
};

const rings = [
  { x: 200, y: 440, r: 10, collected: false },
  { x: 300, y: 350, r: 10, collected: false },
  { x: 520, y: 285, r: 10, collected: false },
  { x: 610, y: 285, r: 10, collected: false },
  { x: 700, y: 285, r: 10, collected: false },
  { x: 930, y: 240, r: 10, collected: false },
  { x: 990, y: 240, r: 10, collected: false },
  { x: 1070, y: 240, r: 10, collected: false },
  { x: 1190, y: 300, r: 10, collected: false },
  { x: 1250, y: 300, r: 10, collected: false },
  { x: 1495, y: 220, r: 10, collected: false },
  { x: 1565, y: 220, r: 10, collected: false },
  { x: 1630, y: 220, r: 10, collected: false },
  { x: 1790, y: 320, r: 10, collected: false },
  { x: 1865, y: 320, r: 10, collected: false },
  { x: 2100, y: 260, r: 10, collected: false },
  { x: 2145, y: 260, r: 10, collected: false },
  { x: 2185, y: 260, r: 10, collected: false },
  { x: 2300, y: 316, r: 10, collected: false },
  { x: 2365, y: 316, r: 10, collected: false }
];

const enemies = [
  { x: 620, y: 458, w: 32, h: 32, minX: 560, maxX: 760, vx: 90, dead: false },
  { x: 1030, y: 458, w: 32, h: 32, minX: 960, maxX: 1160, vx: 110, dead: false },
  { x: 1500, y: 458, w: 32, h: 32, minX: 1430, maxX: 1705, vx: 110, dead: false },
  { x: 1840, y: 458, w: 32, h: 32, minX: 1760, maxX: 1980, vx: 120, dead: false }
];

const finishFlag = { x: 2390, y: 420, w: 16, h: 80 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function syncHud() {
  ringsLabel.textContent = String(state.rings);
  livesLabel.textContent = String(state.lives);
  timerLabel.textContent = formatTime(state.time);
}

function showOverlay(title, text, buttonText) {
  overlay.style.display = 'grid';
  overlay.querySelector('h1').innerHTML = title;
  overlay.querySelector('p').textContent = text;
  startBtn.textContent = buttonText;
}

function hideOverlay() {
  overlay.style.display = 'none';
}

function resetPlayer() {
  player.x = 90;
  player.y = 370;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.invulnerable = 1.2;
  player.coyote = 0;
}

function resetGame() {
  state.running = false;
  state.paused = false;
  state.finished = false;
  state.time = 0;
  state.rings = 0;
  state.lives = 3;
  state.cameraX = 0;
  for (const ring of rings) ring.collected = false;
  for (const enemy of enemies) enemy.dead = false;
  resetPlayer();
  syncHud();
  showOverlay('SONIC<br>CORRIDA TROPICAL', 'Corra pela ilha, pegue anéis dourados e desvie dos robôs do Dr. Eggman. Chegue à placa de chegada!', 'COMEÇAR A CORRIDA ▶');
}

function startGame() {
  state.running = true;
  state.paused = false;
  state.finished = false;
  state.time = 0;
  state.rings = 0;
  state.lives = 3;
  state.cameraX = 0;
  for (const ring of rings) ring.collected = false;
  for (const enemy of enemies) enemy.dead = false;
  resetPlayer();
  syncHud();
  hideOverlay();
}

function togglePause() {
  if (!state.running || state.finished) return;
  state.paused = !state.paused;
  if (state.paused) {
    showOverlay('PAUSADO', 'Aperte P ou toque em continuar para voltar à corrida.', 'CONTINUAR');
  } else {
    hideOverlay();
  }
}

function loseLife() {
  if (player.invulnerable > 0) return;
  state.lives -= 1;
  if (state.lives <= 0) {
    state.running = false;
    state.finished = true;
    showOverlay('FIM DE<br>JOGO', 'Os robôs venceram esta volta. Tente novamente!', 'TENTAR NOVAMENTE');
    syncHud();
    return;
  }
  resetPlayer();
  syncHud();
}

function winGame() {
  state.running = false;
  state.finished = true;
  showOverlay('VITÓRIA!', 'Você concluiu a corrida tropical e saiu com a vitória!', 'JOGAR NOVAMENTE');
}

function updatePlayer(dt) {
  const moveDirection = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
  const targetSpeed = moveDirection * player.speed;
  const accel = 2200;
  const decel = 2400;

  if (moveDirection !== 0) {
    player.vx += (targetSpeed - player.vx) * Math.min(1, dt * accel / 60);
    player.facing = moveDirection;
  } else {
    const friction = player.onGround ? decel : 600;
    if (Math.abs(player.vx) < 10) player.vx = 0;
    else player.vx += (0 - player.vx) * Math.min(1, dt * friction / 60);
  }

  if (controls.jump && (player.onGround || player.coyote > 0)) {
    player.vy = -player.jumpForce;
    player.onGround = false;
    player.coyote = 0;
  }

  player.vy += 1700 * dt;
  if (player.vy > 1100) player.vy = 1100;

  const prevX = player.x;
  const prevY = player.y;

  player.x += player.vx * dt;
  for (const plat of platforms) {
    if (!rectsIntersect(player, plat)) continue;
    if (prevX + player.w <= plat.x + 4) {
      player.x = plat.x - player.w;
    } else if (prevX >= plat.x + plat.w - 4) {
      player.x = plat.x + plat.w;
    }
    player.vx = 0;
  }

  player.y += player.vy * dt;
  player.onGround = false;
  for (const plat of platforms) {
    if (!rectsIntersect(player, plat)) continue;
    if (prevY + player.h <= plat.y + 8) {
      player.y = plat.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (prevY >= plat.y + plat.h - 8) {
      player.y = plat.y + plat.h;
      player.vy = Math.max(player.vy, 0);
    } else if (prevX + player.w <= plat.x + 8) {
      player.x = plat.x - player.w;
      player.vx = 0;
    } else if (prevX >= plat.x + plat.w - 8) {
      player.x = plat.x + plat.w;
      player.vx = 0;
    }
  }

  if (!player.onGround) {
    player.coyote = Math.max(0, player.coyote - dt);
  } else {
    player.coyote = 0.12;
  }

  if (player.y > WORLD.height + 120) {
    loseLife();
  }

  player.invulnerable = Math.max(0, player.invulnerable - dt);
  controls.jump = false;
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
      enemy.vx *= -1;
      enemy.x = clamp(enemy.x, enemy.minX, enemy.maxX - enemy.w);
    }

    const hitbox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
    if (rectsIntersect(player, hitbox)) {
      const playerBottom = player.y + player.h;
      const enemyTop = enemy.y;
      if (player.vy > 120 && playerBottom - enemyTop < 22) {
        enemy.dead = true;
        player.vy = -420;
      } else {
        loseLife();
      }
    }
  }
}

function updateRings() {
  for (const ring of rings) {
    if (ring.collected) continue;
    const dx = player.x + player.w / 2 - ring.x;
    const dy = player.y + player.h / 2 - ring.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 28) {
      ring.collected = true;
      state.rings += 1;
      syncHud();
    }
  }
}

function updateFinish() {
  const flagBox = { x: finishFlag.x, y: finishFlag.y, w: finishFlag.w, h: finishFlag.h };
  if (rectsIntersect(player, flagBox)) {
    winGame();
  }
}

function update(dt) {
  state.time += dt;
  state.cameraX = clamp(player.x - canvas.width * 0.35, 0, WORLD.width - canvas.width);
  updatePlayer(dt);
  updateEnemies(dt);
  updateRings();
  updateFinish();
  syncHud();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#7ae0ff');
  sky.addColorStop(0.55, '#95ebff');
  sky.addColorStop(1, '#d9f9ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffd167';
  ctx.beginPath();
  ctx.arc(780, 112, 52, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const x = 120 + i * 210 - state.cameraX * 0.15;
    const y = 90 + (i % 2) * 28;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.arc(x + 28, y - 7, 22, 0, Math.PI * 2);
    ctx.arc(x + 62, y + 4, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#7ec76f';
  ctx.beginPath();
  ctx.moveTo(0, 430);
  ctx.lineTo(120, 310);
  ctx.lineTo(260, 430);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(300, 430);
  ctx.lineTo(455, 270);
  ctx.lineTo(660, 430);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(720, 430);
  ctx.lineTo(890, 300);
  ctx.lineTo(1040, 430);
  ctx.fill();
}

function drawWorld() {
  ctx.save();
  ctx.translate(-state.cameraX, 0);

  for (const plat of platforms) {
    if (plat.y > 500) {
      ctx.fillStyle = '#3a7b38';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#9fe26b';
      ctx.fillRect(plat.x, plat.y, plat.w, 6);
    } else {
      ctx.fillStyle = '#5d9d46';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#95d35f';
      ctx.fillRect(plat.x, plat.y, plat.w, 6);
    }
  }

  for (const ring of rings) {
    if (ring.collected) continue;
    ctx.save();
    ctx.translate(ring.x, ring.y);
    ctx.rotate((state.time * 6) % (Math.PI * 2));
    ctx.fillStyle = '#ffe25b';
    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff6b2';
    ctx.beginPath();
    ctx.arc(-2, -3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    ctx.fillStyle = '#c9d4df';
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = '#0d2743';
    ctx.fillRect(enemy.x + 6, enemy.y + 8, 8, 8);
    ctx.fillRect(enemy.x + 18, enemy.y + 8, 8, 8);
    ctx.fillStyle = '#d44b4b';
    ctx.fillRect(enemy.x + 4, enemy.y + enemy.h - 8, enemy.w - 8, 6);
  }

  const px = player.x;
  const py = player.y;
  const facing = player.facing;
  ctx.save();
  ctx.translate(px + player.w / 2, py + player.h / 2);
  ctx.scale(facing, 1);
  ctx.fillStyle = '#0874df';
  ctx.beginPath();
  ctx.moveTo(-7, -9);
  ctx.lineTo(-18, -18);
  ctx.lineTo(-14, -5);
  ctx.lineTo(-23, -8);
  ctx.lineTo(-14, 2);
  ctx.lineTo(-20, 10);
  ctx.lineTo(-7, 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-1, 1, 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5c99b';
  ctx.beginPath();
  ctx.ellipse(6, 5, 8, 6, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(4, -7, 4.5, 7, 0.15, 0, Math.PI * 2);
  ctx.ellipse(10, -6, 3.5, 6, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#142b55';
  ctx.beginPath();
  ctx.arc(5, -5, 1.8, 0, Math.PI * 2);
  ctx.arc(11, -4, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-6, 17, 9, 4.5, -0.08, 0, Math.PI * 2);
  ctx.ellipse(7, 17, 9, 4.5, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ed3c45';
  ctx.beginPath();
  ctx.ellipse(-6, 15, 8, 4, -0.08, 0, Math.PI * 2);
  ctx.ellipse(7, 15, 8, 4, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (player.invulnerable > 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x - 4, player.y - 4, player.w + 8, player.h + 8);
  }

  const flagX = finishFlag.x;
  const flagY = finishFlag.y;
  ctx.fillStyle = '#7c4b1d';
  ctx.fillRect(flagX, flagY, 6, finishFlag.h);
  ctx.fillStyle = '#ffef5c';
  ctx.fillRect(flagX + 6, flagY + 10, 58, 32);
  ctx.strokeStyle = '#f56d2b';
  ctx.lineWidth = 2;
  ctx.strokeRect(flagX + 6, flagY + 10, 58, 32);

  ctx.restore();
}

function draw() {
  drawBackground();
  drawWorld();
}

function setKeyState(key, isPressed) {
  if (key === 'left') controls.left = isPressed;
  if (key === 'right') controls.right = isPressed;
  if (key === 'jump') controls.jump = isPressed;
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['arrowleft', 'a'].includes(key)) {
    event.preventDefault();
    setKeyState('left', true);
  }
  if (['arrowright', 'd'].includes(key)) {
    event.preventDefault();
    setKeyState('right', true);
  }
  if (['arrowup', 'w', ' ', 'spacebar'].includes(key) || event.code === 'Space') {
    event.preventDefault();
    if (!controls.jump) {
      setKeyState('jump', true);
    }
  }
  if (key === 'p') {
    event.preventDefault();
    togglePause();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (['arrowleft', 'a'].includes(key)) setKeyState('left', false);
  if (['arrowright', 'd'].includes(key)) setKeyState('right', false);
  if (['arrowup', 'w', ' ', 'spacebar'].includes(key) || event.code === 'Space') setKeyState('jump', false);
});

const touchButtons = Array.from(document.querySelectorAll('.touch'));
for (const button of touchButtons) {
  const key = button.dataset.key;
  const activate = (event) => {
    event.preventDefault();
    setKeyState(key, true);
  };
  const deactivate = (event) => {
    event.preventDefault();
    setKeyState(key, false);
  };
  button.addEventListener('pointerdown', activate);
  button.addEventListener('pointerup', deactivate);
  button.addEventListener('pointerleave', deactivate);
  button.addEventListener('pointercancel', deactivate);
}

startBtn.addEventListener('click', () => {
  if (state.paused) {
    state.paused = false;
    hideOverlay();
    return;
  }
  if (!state.running || state.finished) {
    startGame();
  }
});

function loop(timestamp) {
  const dt = Math.min((timestamp - (state.lastTs || timestamp)) / 1000, 0.033);
  state.lastTs = timestamp;
  if (state.running && !state.paused) {
    update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}

resetGame();
requestAnimationFrame(loop);
