/**
 * ORIÓN ARCADE - MANDO VIRTUAL PARA CELULAR (PAD.JS)
 * IASD Pacajes
 */

class OrionGamepadController {
  constructor() {
    this.supabase = null;
    this.channel = null;
    this.roomId = '';
    this.isConnected = false;
    this.vibrationEnabled = true;

    this.cacheDOM();
    this.initSupabase();
    this.checkUrlRoom();
    this.bindControls();
    this.bindFullscreen();
  }

  cacheDOM() {
    this.connectOverlay = document.getElementById('connect-overlay');
    this.pinInput = document.getElementById('pin-input');
    this.connectBtn = document.getElementById('connect-btn');
    this.roomDisplay = document.getElementById('room-display');
    this.statusDot = document.getElementById('status-dot');

    this.btnVibra = document.getElementById('btn-vibra');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnStart = document.getElementById('btn-start');
    this.btnPause = document.getElementById('btn-pause');

    // D-Pad buttons
    this.dpadUp = document.getElementById('dpad-up');
    this.dpadDown = document.getElementById('dpad-down');
    this.dpadLeft = document.getElementById('dpad-left');
    this.dpadRight = document.getElementById('dpad-right');

    // Action buttons
    this.btnFire = document.getElementById('btn-fire');
    this.btnBomb = document.getElementById('btn-bomb');
  }

  initSupabase() {
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY) {
      this.supabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
      );
    } else {
      console.warn('Supabase JS not available, falling back to local BroadcastChannel.');
    }
  }

  checkUrlRoom() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      this.roomId = roomParam.trim().toUpperCase();
      this.connectToRoom(this.roomId);
    } else {
      // Show PIN entry overlay
      this.connectOverlay.classList.remove('hidden');
      this.connectBtn.addEventListener('click', () => {
        const pin = this.pinInput.value.trim().toUpperCase();
        if (pin) {
          this.roomId = pin;
          this.connectToRoom(this.roomId);
        }
      });
    }
  }

  connectToRoom(roomId) {
    this.roomId = roomId;
    this.roomDisplay.textContent = `SALA: ${roomId}`;

    if (this.connectOverlay) {
      this.connectOverlay.classList.add('hidden');
    }

    if (window.OrionSync) {
      this.syncChannel = window.OrionSync.createChannel(roomId, 'client');

      this.syncChannel.on('_network_connected', () => {
        this.isConnected = true;
        this.statusDot.classList.remove('offline');
        this.announceConnection();
      });

      this.syncChannel.on('rumble', (payload) => {
        if (payload?.pattern) this.vibrate(payload.pattern);
      });
    }

    // Audio feedback synth on mobile
    this.initAudio();

    // Periodic announcement
    this.startConnectingAnnouncements();
  }

  startConnectingAnnouncements() {
    clearInterval(this.announceInterval);
    this.announceConnection();
    this.announceInterval = setInterval(() => {
      this.announceConnection();
    }, 1500);
  }

  announceConnection() {
    if (this.syncChannel) {
      this.syncChannel.send('controller_connected', { device: 'mobile_pad', time: Date.now() });
    }
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    } catch(e) {}
  }

  playClickSound(freq = 600, duration = 0.04) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch(e) {}
  }

  sendInput(key, pressed) {
    // Immediate audio + haptic feedback
    if (pressed) {
      this.playClickSound(key === 'shoot' ? 880 : 520, 0.05);
      this.vibrate(25);
    }

    const payload = { key, pressed, time: Date.now() };

    if (this.syncChannel) {
      this.syncChannel.send('gamepad_input', payload);
    }
  }

  vibrate(pattern) {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  bindTouchButton(element, keyName) {
    if (!element) return;

    let isPressed = false;

    const startPress = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (isPressed) return;
      isPressed = true;
      element.classList.add('pressed');
      this.sendInput(keyName, true);
    };

    const endPress = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (!isPressed) return;
      isPressed = false;
      element.classList.remove('pressed');
      this.sendInput(keyName, false);
    };

    // Modern Pointer Events (Standard on modern iOS & Android)
    element.addEventListener('pointerdown', (e) => {
      try { element.setPointerCapture(e.pointerId); } catch(err){}
      startPress(e);
    }, { passive: false });

    element.addEventListener('pointerup', (e) => {
      try { element.releasePointerCapture(e.pointerId); } catch(err){}
      endPress(e);
    }, { passive: false });

    element.addEventListener('pointercancel', (e) => {
      try { element.releasePointerCapture(e.pointerId); } catch(err){}
      endPress(e);
    }, { passive: false });

    // Touch event fallbacks for older webviews
    element.addEventListener('touchstart', startPress, { passive: false });
    element.addEventListener('touchend', endPress, { passive: false });
    element.addEventListener('touchcancel', endPress, { passive: false });

    // Mouse events for desktop browser testing
    element.addEventListener('mousedown', startPress);
    element.addEventListener('mouseup', endPress);
    element.addEventListener('mouseleave', endPress);
  }

  bindControls() {
    // D-Pad
    this.bindTouchButton(this.dpadUp, 'up');
    this.bindTouchButton(this.dpadDown, 'down');
    this.bindTouchButton(this.dpadLeft, 'left');
    this.bindTouchButton(this.dpadRight, 'right');

    // Actions
    this.bindTouchButton(this.btnFire, 'shoot');
    this.bindTouchButton(this.btnBomb, 'bomb');

    // Start & Pause
    this.bindTouchButton(this.btnStart, 'start');
    this.bindTouchButton(this.btnPause, 'pause');

    // Toggle Vibration button
    if (this.btnVibra) {
      this.btnVibra.addEventListener('click', () => {
        this.vibrationEnabled = !this.vibrationEnabled;
        this.btnVibra.textContent = this.vibrationEnabled ? '📳 VIBRA: ON' : '📳 VIBRA: OFF';
        if (this.vibrationEnabled) this.vibrate(40);
      });
    }
  }

  bindFullscreen() {
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          const el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OrionGamepadController();
});
