/**
 * ORIÓN ARCADE - 2D Pixel Art Interactive Engine
 * IASD Pacajes - Ministerio Joven & Recreación
 */

// ==========================================
// 1. WEB AUDIO API - 8-BIT SOUND SYNTHESIZER
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.setValueAtTime(0.2, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  playLaser() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  playSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(659.25, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playPowerup() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [330, 440, 550, 660, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + idx * 0.05);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.08);
    });
  }

  playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 415, 392, 349];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.18, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.15);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

const audio = new SoundSynth();

// ==========================================
// 2. PARALLAX PIXEL SPACE BACKGROUND CANVAS
// ==========================================
class SpaceCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.resize();
    this.initStars();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 3800);
    const colors = ['#ffffff', '#00f5ff', '#ff007f', '#ffe600', '#9d4edd'];

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() < 0.8 ? 2 : (Math.random() < 0.95 ? 3 : 4),
        speed: 0.15 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.01 + Math.random() * 0.03
      });
    }
  }

  triggerShootingStar() {
    if (Math.random() < 0.006 && this.shootingStars.length < 2) {
      this.shootingStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.4),
        length: 60 + Math.random() * 70,
        speed: 8 + Math.random() * 6,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
        opacity: 1
      });
    }
  }

  animate() {
    this.ctx.fillStyle = '#080312';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle cosmic nebula clouds in background
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.35, 10,
      this.width * 0.5, this.height * 0.35, this.width * 0.6
    );
    gradient.addColorStop(0, 'rgba(88, 28, 135, 0.25)');
    gradient.addColorStop(0.5, 'rgba(219, 39, 119, 0.10)');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Orion Constellation lines in center background
    this.drawOrionConstellation();

    // Draw pixel stars
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.05;
      star.alpha = Math.max(0.2, Math.min(1, star.alpha));

      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha;
      this.ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    });
    this.ctx.globalAlpha = 1.0;

    // Shooting stars
    this.triggerShootingStar();
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.015;

      if (s.opacity <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.ctx.strokeStyle = `rgba(0, 245, 255, ${s.opacity})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
      this.ctx.stroke();
    }

    requestAnimationFrame(() => this.animate());
  }

  drawOrionConstellation() {
    const cx = this.width * 0.5;
    const cy = Math.min(260, this.height * 0.25);
    const scale = Math.min(this.width / 1100, 1);

    // Stars of Orion (Betelgeuse, Bellatrix, Alnitak, Alnilam, Mintaka, Saiph, Rigel)
    const points = {
      betelgeuse: { x: cx - 90 * scale, y: cy - 70 * scale, name: 'Betelgeuse', color: '#ff7700', size: 6 },
      bellatrix:  { x: cx + 80 * scale, y: cy - 60 * scale, name: 'Bellatrix',  color: '#00f5ff', size: 5 },
      alnitak:    { x: cx - 25 * scale, y: cy + 15 * scale, name: 'Alnitak',    color: '#00f5ff', size: 4 },
      alnilam:    { x: cx,             y: cy + 10 * scale, name: 'Alnilam',    color: '#ffe600', size: 5 },
      mintaka:    { x: cx + 25 * scale, y: cy + 5 * scale,  name: 'Mintaka',    color: '#00f5ff', size: 4 },
      saiph:      { x: cx - 80 * scale, y: cy + 85 * scale, name: 'Saiph',      color: '#00f5ff', size: 5 },
      rigel:      { x: cx + 95 * scale, y: cy + 80 * scale, name: 'Rigel',      color: '#ffffff', size: 7 }
    };

    // Draw dashed connecting lines
    this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.22)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);

    const lines = [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['saiph', 'rigel']
    ];

    lines.forEach(([p1, p2]) => {
      this.ctx.beginPath();
      this.ctx.moveTo(points[p1].x, points[p1].y);
      this.ctx.lineTo(points[p2].x, points[p2].y);
      this.ctx.stroke();
    });

    this.ctx.setLineDash([]);

    // Draw the Orion stars with pulsing pixel aura
    Object.values(points).forEach(p => {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.3;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(p.x - (p.size * pulse) / 2, p.y - (p.size * pulse) / 2, p.size * pulse, p.size * pulse);
      this.ctx.shadowBlur = 0;
    });
  }
}

// ==========================================
// 3. 2D PIXEL ARCADE GAME: "ORIÓN: DEFENSOR"
// ==========================================
class OrionGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('orion_high_score') || '99990', 10);
    this.lives = 3;
    this.level = 1;
    this.credits = 4;

    this.player = {
      x: 200,
      y: 350,
      width: 26,
      height: 26,
      speed: 5.5,
      power: 1,
      invulnerable: 0
    };

    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.stars = [];

    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false
    };

    this.lastShotTime = 0;
    this.shootInterval = 175; // ms between shots
    this.spawnTimer = 0;

    this.resizeCanvas();
    this.initGameStars();
    this.setupListeners();
    this.updateHUD();
    this.renderIntroScreen();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.min(800, rect.width || 800);
    this.canvas.height = 420;
    this.player.x = this.canvas.width / 2 - 13;
    this.player.y = this.canvas.height - 50;
  }

  initGameStars() {
    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: 1 + Math.random() * 3,
        size: Math.random() < 0.8 ? 2 : 3,
        color: Math.random() < 0.5 ? '#00f5ff' : '#ffffff'
      });
    }
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['Space', 'KeyK', 'KeyJ'].includes(e.code)) {
        this.keys.shoot = true;
        if (!this.isPlaying && e.code === 'Space') {
          this.start();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['Space', 'KeyK', 'KeyJ'].includes(e.code)) this.keys.shoot = false;
    });

    // Touch button handlers
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnFire = document.getElementById('touch-fire');

    if (btnLeft) {
      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.left = true; });
      btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.left = false; });
    }
    if (btnRight) {
      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.right = true; });
      btnRight.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.right = false; });
    }
    if (btnFire) {
      btnFire.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        this.keys.shoot = true;
        if (!this.isPlaying) this.start();
      });
      btnFire.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.shoot = false; });
    }
  }

  start() {
    if (this.credits <= 0) {
      this.credits = 1;
      this.updateHUD();
    }
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.player.power = 1;
    this.player.x = this.canvas.width / 2 - 13;
    this.player.y = this.canvas.height - 50;
    this.isPlaying = true;

    audio.playSelect();

    const overlay = document.getElementById('game-ui-overlay');
    if (overlay) overlay.classList.add('hidden');

    this.updateHUD();
    this.loop();
  }

  addCredit() {
    this.credits++;
    audio.playCoin();
    this.updateHUD();
    
    // Marquee visual feedback
    const coinBtn = document.getElementById('insert-coin-btn');
    if (coinBtn) {
      coinBtn.textContent = '★ COIN INSERTED! ★';
      setTimeout(() => {
        coinBtn.textContent = 'INSERT COIN [1 COIN = 1 PLAY]';
      }, 1000);
    }
  }

  updateHUD() {
    const elScore = document.getElementById('hud-score');
    const elHigh = document.getElementById('hud-highscore');
    const elLives = document.getElementById('hud-lives');
    const elCredits = document.getElementById('hud-credits');

    if (elScore) elScore.textContent = this.score.toString().padStart(6, '0');
    if (elHigh) elHigh.textContent = this.highScore.toString().padStart(6, '0');
    if (elCredits) elCredits.textContent = `CRÉDITOS: ${this.credits.toString().padStart(2, '0')}`;
    if (elLives) {
      let hearts = '';
      for (let i = 0; i < this.lives; i++) hearts += '❤️ ';
      elLives.textContent = hearts || '💀 0';
    }
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShotTime < this.shootInterval) return;
    this.lastShotTime = now;

    audio.playLaser();

    if (this.player.power === 1) {
      this.bullets.push({
        x: this.player.x + 11,
        y: this.player.y - 4,
        width: 4,
        height: 12,
        speed: 8,
        color: '#00f5ff'
      });
    } else {
      // Double shot
      this.bullets.push({
        x: this.player.x + 4,
        y: this.player.y - 4,
        width: 4,
        height: 12,
        speed: 8.5,
        color: '#ffe600'
      });
      this.bullets.push({
        x: this.player.x + 18,
        y: this.player.y - 4,
        width: 4,
        height: 12,
        speed: 8.5,
        color: '#ffe600'
      });
    }
  }

  spawnEnemy() {
    this.spawnTimer++;
    if (this.spawnTimer % 35 === 0) {
      const types = ['meteor', 'drone', 'hunter'];
      const type = types[Math.floor(Math.random() * types.length)];
      const size = type === 'meteor' ? 24 : 20;

      this.enemies.push({
        type,
        x: Math.random() * (this.canvas.width - size),
        y: -30,
        width: size,
        height: size,
        speed: 1.5 + Math.random() * 2 + (this.score > 2000 ? 1 : 0),
        hp: type === 'meteor' ? 2 : 1,
        color: type === 'meteor' ? '#ff7700' : (type === 'drone' ? '#ff007f' : '#00f5ff')
      });
    }
  }

  createExplosion(x, y, color = '#ff007f', count = 14) {
    audio.playExplosion();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() < 0.6 ? 3 : 5,
        color,
        life: 25 + Math.random() * 15
      });
    }
  }

  checkCollisions() {
    // Bullets vs Enemies
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          this.bullets.splice(bi, 1);
          e.hp--;
          this.createExplosion(b.x, b.y, '#00f5ff', 4);

          if (e.hp <= 0) {
            this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color, 16);
            this.enemies.splice(ei, 1);
            this.score += e.type === 'meteor' ? 150 : 250;

            // Chance to drop power-up
            if (Math.random() < 0.12) {
              this.powerups.push({
                x: e.x,
                y: e.y,
                width: 14,
                height: 14,
                speed: 1.8
              });
            }

            if (this.score > this.highScore) {
              this.highScore = this.score;
              localStorage.setItem('orion_high_score', this.highScore);
            }
            this.updateHUD();
          }
          break;
        }
      }
    }

    // Player vs Powerups
    for (let pi = this.powerups.length - 1; pi >= 0; pi--) {
      const p = this.powerups[pi];
      if (
        this.player.x < p.x + p.width &&
        this.player.x + this.player.width > p.x &&
        this.player.y < p.y + p.height &&
        this.player.y + this.player.height > p.y
      ) {
        this.powerups.splice(pi, 1);
        this.player.power = 2;
        this.score += 500;
        audio.playPowerup();
        this.createExplosion(p.x, p.y, '#ffe600', 12);
        this.updateHUD();
      }
    }

    // Player vs Enemies
    if (this.player.invulnerable <= 0) {
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (
          this.player.x < e.x + e.width &&
          this.player.x + this.player.width > e.x &&
          this.player.y < e.y + e.height &&
          this.player.y + this.player.height > e.y
        ) {
          this.enemies.splice(ei, 1);
          this.createExplosion(this.player.x + 13, this.player.y + 13, '#ff007f', 24);
          this.lives--;
          this.player.power = 1;
          this.player.invulnerable = 60; // frames of invulnerability
          this.updateHUD();

          if (this.lives <= 0) {
            this.gameOver();
          }
          break;
        }
      }
    }
  }

  gameOver() {
    this.isPlaying = false;
    audio.playGameOver();
    const overlay = document.getElementById('game-ui-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      const title = overlay.querySelector('.game-overlay-title');
      const desc = overlay.querySelector('.game-overlay-desc');
      const btn = overlay.querySelector('.game-start-btn');

      if (title) title.textContent = '★ GAME OVER ★';
      if (desc) desc.innerHTML = `PUNTUACIÓN FINAL: <strong style="color:var(--color-neon-yellow);">${this.score} PTS</strong><br>¡Buen intento, defensor de Orión! Inserta otra ficha para continuar.`;
      if (btn) btn.textContent = 'REINTENTAR [PRESS START]';
    }
  }

  loop() {
    if (!this.isPlaying) return;

    this.ctx.fillStyle = '#06020e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & draw background stars in game
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.canvas.height) {
        s.y = 0;
        s.x = Math.random() * this.canvas.width;
      }
      this.ctx.fillStyle = s.color;
      this.ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });

    // Player Movement
    if (this.keys.left && this.player.x > 0) this.player.x -= this.player.speed;
    if (this.keys.right && this.player.x < this.canvas.width - this.player.width) this.player.x += this.player.speed;
    if (this.keys.up && this.player.y > 50) this.player.y -= this.player.speed;
    if (this.keys.down && this.player.y < this.canvas.height - this.player.height) this.player.y += this.player.speed;

    if (this.keys.shoot) this.shoot();
    if (this.player.invulnerable > 0) this.player.invulnerable--;

    // Draw Player Spaceship (Pixel Art)
    if (this.player.invulnerable % 4 < 2) {
      this.drawPlayerShip(this.player.x, this.player.y);
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y -= b.speed;
      if (b.y < -10) {
        this.bullets.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = b.color;
      this.ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    // Enemies
    this.spawnEnemy();
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speed;
      if (e.y > this.canvas.height + 20) {
        this.enemies.splice(i, 1);
        continue;
      }
      this.drawEnemy(e);
    }

    // Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += p.speed;
      if (p.y > this.canvas.height + 20) {
        this.powerups.splice(i, 1);
        continue;
      }
      // Glowing P icon
      this.ctx.fillStyle = '#ffe600';
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
      this.ctx.fillStyle = '#000';
      this.ctx.font = '10px "Press Start 2P"';
      this.ctx.fillText('P', p.x + 2, p.y + 11);
    }

    // Explosions / Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.fillStyle = pt.color;
      this.ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
    }

    this.checkCollisions();

    requestAnimationFrame(() => this.loop());
  }

  drawPlayerShip(x, y) {
    // 2D Pixel Spaceship
    const c = this.ctx;
    // Wing thrusters glow
    c.fillStyle = Math.random() < 0.5 ? '#00f5ff' : '#ff007f';
    c.fillRect(x + 4, y + 22, 4, 4);
    c.fillRect(x + 18, y + 22, 4, 4);

    // Wings
    c.fillStyle = '#38bdf8';
    c.fillRect(x, y + 14, 26, 6);
    c.fillRect(x + 2, y + 8, 22, 6);

    // Hull Core
    c.fillStyle = '#ffffff';
    c.fillRect(x + 9, y + 2, 8, 20);

    // Cockpit
    c.fillStyle = '#ff007f';
    c.fillRect(x + 11, y + 6, 4, 8);

    // Tip Cannon
    c.fillStyle = '#ffe600';
    c.fillRect(x + 12, y, 2, 4);
  }

  drawEnemy(e) {
    const c = this.ctx;
    if (e.type === 'meteor') {
      // Pixel Asteroid
      c.fillStyle = '#854d0e';
      c.fillRect(e.x + 4, e.y, e.width - 8, e.height);
      c.fillRect(e.x, e.y + 4, e.width, e.height - 8);
      c.fillStyle = '#ca8a04';
      c.fillRect(e.x + 6, e.y + 6, 6, 6);
    } else {
      // Pixel Alien Drone
      c.fillStyle = e.color;
      c.fillRect(e.x + 2, e.y + 4, e.width - 4, 10);
      c.fillRect(e.x + 6, e.y, e.width - 12, 16);
      // Glowing eye
      c.fillStyle = '#ffffff';
      c.fillRect(e.x + e.width / 2 - 2, e.y + 6, 4, 4);
    }
  }

  renderIntroScreen() {
    this.ctx.fillStyle = '#06020e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw starfield preview
    this.stars.forEach(s => {
      this.ctx.fillStyle = s.color;
      this.ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
  }
}

// ==========================================
// 4. HIGH SCORES SYSTEM & INITIALS
// ==========================================
const DEFAULT_SCORES = [
  { rank: '1ST', name: 'PAC', score: '99990', date: 'HOY' },
  { rank: '2ND', name: 'ORI', score: '84250', date: '24/10' },
  { rank: '3RD', name: 'JAS', score: '62100', date: '22/10' },
  { rank: '4TH', name: 'CON', score: '48300', date: '20/10' },
  { rank: '5TH', name: 'AVE', score: '31500', date: '19/10' }
];

function loadHighScores() {
  const stored = localStorage.getItem('orion_hall_of_fame');
  return stored ? JSON.parse(stored) : DEFAULT_SCORES;
}

function renderHighScores() {
  const tbody = document.getElementById('high-scores-body');
  if (!tbody) return;

  const scores = loadHighScores();
  tbody.innerHTML = scores.map((s, idx) => `
    <tr>
      <td class="score-rank-${idx + 1}">${s.rank}</td>
      <td style="color:#fff;">${s.name}</td>
      <td style="color:var(--color-neon-cyan);">${s.score}</td>
      <td style="color:var(--color-pixel-gray); font-size: 1.1rem;">${s.date}</td>
    </tr>
  `).join('');
}

// ==========================================
// 5. TRIVIA BÍBLICA 8-BIT MODAL DEMO
// ==========================================
const TRIVIA_QUESTIONS = [
  {
    q: '¿Quién fue tragado por un gran pez?',
    options: ['Jonás', 'Moisés', 'David', 'Pedro'],
    ans: 0
  },
  {
    q: '¿Cuántos días y noches llovió en el diluvio?',
    options: ['7 días', '40 días', '100 días', '12 días'],
    ans: 1
  },
  {
    q: '¿Cuál es el libro de la Biblia con más capítulos?',
    options: ['Génesis', 'Salmos', 'Isaías', 'Apocalipsis'],
    ans: 1
  }
];

let currentTriviaIdx = 0;

function launchBibleTrivia() {
  audio.playSelect();
  const modal = document.getElementById('score-modal');
  const dialog = modal.querySelector('.score-modal-dialog');
  if (!modal || !dialog) return;

  const q = TRIVIA_QUESTIONS[currentTriviaIdx % TRIVIA_QUESTIONS.length];

  dialog.innerHTML = `
    <h3 style="color:var(--color-neon-cyan); font-size:1.1rem; margin-bottom:1rem; text-shadow:2px 2px #ff007f;">
      📖 TRIVIA BÍBLICA 8-BIT
    </h3>
    <p style="font-family:var(--font-silk); font-size:0.9rem; color:#fff; line-height:1.5; margin-bottom:1.5rem;">
      ${q.q}
    </p>
    <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
      ${q.options.map((opt, i) => `
        <button class="arcade-toggle-btn" onclick="checkTriviaAnswer(${i})" style="text-align:left; font-size:0.75rem; padding:0.75rem;">
          ${String.fromCharCode(65 + i)}) ${opt}
        </button>
      `).join('')}
    </div>
    <button class="submit-score-btn" onclick="closeTriviaModal()" style="font-size:0.7rem;">CERRAR</button>
  `;

  modal.classList.add('active');
}

window.checkTriviaAnswer = function(chosenIdx) {
  const q = TRIVIA_QUESTIONS[currentTriviaIdx % TRIVIA_QUESTIONS.length];
  if (chosenIdx === q.ans) {
    audio.playPowerup();
    alert('✨ ¡CORRECTO! +500 PTS');
    currentTriviaIdx++;
  } else {
    audio.playGameOver();
    alert('❌ ¡INCORRECTO! Sigue estudiando las escrituras.');
  }
  closeTriviaModal();
};

window.closeTriviaModal = function() {
  const modal = document.getElementById('score-modal');
  if (modal) modal.classList.remove('active');
};

// ==========================================
// 6. INITIALIZATION & DOM BINDINGS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Background canvas
  new SpaceCanvas('space-canvas');

  // Orion Arcade mini-game
  const game = new OrionGame('game-canvas');

  // Insert Coin button
  const insertCoinBtn = document.getElementById('insert-coin-btn');
  if (insertCoinBtn) {
    insertCoinBtn.addEventListener('click', () => {
      game.addCredit();
    });
  }

  // Start button in overlay
  const startBtn = document.getElementById('game-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      game.start();
    });
  }

  // CRT Scanlines toggle
  const crtBtn = document.getElementById('toggle-crt-btn');
  const crtOverlay = document.getElementById('crt-overlay');
  if (crtBtn && crtOverlay) {
    crtBtn.addEventListener('click', () => {
      audio.playSelect();
      crtOverlay.classList.toggle('disabled');
      const isDisabled = crtOverlay.classList.contains('disabled');
      crtBtn.textContent = isDisabled ? 'CRT: OFF' : 'CRT: ON';
    });
  }

  // Sound Mute Toggle
  const soundBtn = document.getElementById('toggle-sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const muted = audio.toggleMute();
      if (!muted) audio.playSelect();
      soundBtn.textContent = muted ? 'SOUND: OFF' : 'SOUND: ON';
    });
  }

  // Cards interactive launches
  document.querySelectorAll('[data-launch-game]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const gameType = e.currentTarget.getAttribute('data-launch-game');
      if (gameType === 'orion-defender') {
        audio.playSelect();
        window.scrollTo({ top: document.querySelector('.cabinet-stage').offsetTop - 50, behavior: 'smooth' });
        game.start();
      } else if (gameType === 'bible-trivia') {
        audio.playSelect();
        window.location.href = 'trivia.html';
      } else {
        audio.playSelect();
        alert('🕹️ Próximamente en ORIÓN Arcade Pacajes.');
      }
    });
  });

  // Render High scores
  renderHighScores();

  // Initialize Wireless Mobile Gamepad Receiver
  initPadReceiver(game);
});

// ==========================================
// 7. WIRELESS MOBILE GAMEPAD CONTROLLER SYNC
// ==========================================
let padRoomId = 'ORI-' + Math.floor(10 + Math.random() * 90);
let padChannel = null;

function initPadReceiver(gameInstance) {
  const showConnectedStatus = () => {
    audio.playCoin();
    const statusEl = document.getElementById('pad-conn-status');
    if (statusEl) {
      statusEl.innerHTML = '🟢 ¡CELULAR VINCULADO! Piloto listo para despegar.';
      statusEl.style.color = '#00ff66';
    }
    const badge = document.getElementById('pad-hud-badge');
    const statusText = document.getElementById('hud-pad-status');
    if (badge) badge.style.display = 'flex';
    if (statusText) {
      statusText.textContent = 'ONLINE';
      statusText.style.color = '#00ff66';
    }
  };

  // 1. Supabase Realtime Broadcast
  if (window.supabase && window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY) {
    try {
      const client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
      padChannel = client.channel(`orion_pad_${padRoomId}`, {
        config: { broadcast: { ack: false, self: false } }
      });

      padChannel.on('broadcast', { event: 'controller_connected' }, () => {
        showConnectedStatus();
      });

      padChannel.on('broadcast', { event: 'gamepad_input' }, (res) => {
        const payload = res?.payload?.payload || res?.payload || res;
        if (!payload) return;
        handlePadInput(gameInstance, payload);
      });

      padChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Pad Receiver] Subscribed to orion_pad_${padRoomId}`);
        }
      });
    } catch(err) {
      console.warn('Error initializing Supabase pad channel:', err);
    }
  }

  // 2. BroadcastChannel for local same-browser tab testing
  try {
    const localBc = new BroadcastChannel(`orion_pad_${padRoomId}`);
    localBc.onmessage = (e) => {
      if (e.data && e.data.event === 'gamepad_input') {
        const payload = e.data.payload?.payload || e.data.payload || e.data;
        handlePadInput(gameInstance, payload);
      } else if (e.data && e.data.event === 'controller_connected') {
        showConnectedStatus();
      }
    };
  } catch (err) {}

  // 3. Modal open button
  const btnOpenModal = document.getElementById('btn-open-pad-modal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      audio.playSelect();
      openPadModal();
    });
  }
}

let padHudTimeout = null;

function handlePadInput(gameInstance, payload) {
  const data = (payload && payload.payload) ? payload.payload : payload;
  const { key, pressed } = data || {};
  if (!key) return;

  // Visual HUD feedback on arcade screen
  const badge = document.getElementById('pad-hud-badge');
  const statusText = document.getElementById('hud-pad-status');
  if (badge) badge.style.display = 'flex';
  if (statusText) {
    const iconMap = {
      up: '▲', down: '▼', left: '◄', right: '►',
      shoot: 'FIRE 🔥', bomb: 'BOMBA 💣', start: 'START', pause: 'PAUSE'
    };
    statusText.textContent = pressed ? (iconMap[key] || key.toUpperCase()) : 'ONLINE';
    statusText.style.color = pressed ? '#ffe600' : '#00ff66';

    clearTimeout(padHudTimeout);
    padHudTimeout = setTimeout(() => {
      if (statusText) {
        statusText.textContent = 'ONLINE';
        statusText.style.color = '#00ff66';
      }
    }, 1500);
  }

  // AUTO-START: If not playing, ANY button press immediately starts the game!
  if (pressed && !gameInstance.isPlaying) {
    gameInstance.start();
  }

  // Directions
  if (key === 'left') gameInstance.keys.left = Boolean(pressed);
  if (key === 'right') gameInstance.keys.right = Boolean(pressed);
  if (key === 'up') gameInstance.keys.up = Boolean(pressed);
  if (key === 'down') gameInstance.keys.down = Boolean(pressed);

  // Shoot
  if (key === 'shoot') {
    gameInstance.keys.shoot = Boolean(pressed);
    if (pressed && gameInstance.isPlaying) {
      gameInstance.shoot();
    }
  }

  // Start
  if (key === 'start' && pressed) {
    if (!gameInstance.isPlaying) {
      gameInstance.start();
    }
  }

  // Pause
  if (key === 'pause' && pressed) {
    audio.playSelect();
  }

  // Bomb special attack
  if (key === 'bomb' && pressed && gameInstance.isPlaying) {
    audio.playExplosion();
    gameInstance.enemies.forEach(e => {
      gameInstance.createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ffe600', 16);
      gameInstance.score += 200;
    });
    gameInstance.enemies = [];
    gameInstance.updateHUD();
  }
}

function openPadModal() {
  const modal = document.getElementById('pad-modal');
  const codeEl = document.getElementById('pad-room-code');
  const qrImg = document.getElementById('pad-qr-img');
  const directLink = document.getElementById('pad-direct-link');

  if (!modal) return;

  if (codeEl) codeEl.textContent = padRoomId;

  // Compute controller URL
  let baseUrl = window.location.href.split('#')[0].split('?')[0];
  if (baseUrl.endsWith('index.html')) {
    baseUrl = baseUrl.replace('index.html', 'pad.html');
  } else if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl + 'pad.html';
  } else {
    baseUrl = baseUrl + '/pad.html';
  }

  const padUrlWithRoom = `${baseUrl}?room=${padRoomId}`;

  // QR Code generation via high-availability QR API
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encodeURIComponent(padUrlWithRoom)}`;
  }

  if (directLink) {
    directLink.href = padUrlWithRoom;
  }

  modal.classList.add('active');
}

window.closePadModal = function() {
  const modal = document.getElementById('pad-modal');
  if (modal) modal.classList.remove('active');
};

