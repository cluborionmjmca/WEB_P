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

    if (this.supabase) {
      // Connect using Supabase Realtime Broadcast
      this.channel = this.supabase.channel(`orion_pad_${roomId}`, {
        config: {
          broadcast: {
            ack: false,
            self: false
          }
        }
      });

      this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.statusDot.classList.remove('offline');
          // Announce connection to PC screen
          this.channel.send({
            type: 'broadcast',
            event: 'controller_connected',
            payload: { device: 'mobile_pad', timestamp: Date.now() }
          });
          this.vibrate(60);
        } else if (status === 'CHANNEL_ERROR') {
          this.statusDot.classList.add('offline');
        }
      });

      // Listen for haptic rumble sent from PC (when taking damage or getting powerup)
      this.channel.on('broadcast', { event: 'rumble' }, ({ payload }) => {
        if (payload && payload.pattern) {
          this.vibrate(payload.pattern);
        }
      });
    }

    // Fallback or local dev support with BroadcastChannel
    try {
      this.localBc = new BroadcastChannel(`orion_pad_${roomId}`);
      this.localBc.postMessage({ event: 'controller_connected' });
    } catch (e) {
      // BroadcastChannel not available or cross-origin
    }
  }

  sendInput(key, pressed) {
    // Immediate haptic feedback on touch press
    if (pressed) {
      this.vibrate(25);
    }

    const payload = { key, pressed, time: Date.now() };

    if (this.channel && this.isConnected) {
      this.channel.send({
        type: 'broadcast',
        event: 'gamepad_input',
        payload
      });
    }

    if (this.localBc) {
      this.localBc.postMessage({ event: 'gamepad_input', payload });
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

    const handlePress = (e) => {
      e.preventDefault();
      element.classList.add('pressed');
      this.sendInput(keyName, true);
    };

    const handleRelease = (e) => {
      e.preventDefault();
      element.classList.remove('pressed');
      this.sendInput(keyName, false);
    };

    // Touch events (Mobile)
    element.addEventListener('touchstart', handlePress, { passive: false });
    element.addEventListener('touchend', handleRelease, { passive: false });
    element.addEventListener('touchcancel', handleRelease, { passive: false });

    // Mouse events (Desktop testing)
    element.addEventListener('mousedown', handlePress);
    element.addEventListener('mouseup', handleRelease);
    element.addEventListener('mouseleave', handleRelease);
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
