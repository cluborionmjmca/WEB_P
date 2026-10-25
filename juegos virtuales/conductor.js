/**
 * ORIÓN ARCADE - MANDO VIRTUAL DEL CONDUCTOR (CONDUCTOR.JS)
 * Control remoto en vivo para el presentador de Trivia Bíblica
 * IASD Pacajes
 */

class TriviaConductorController {
  constructor() {
    this.supabase = null;
    this.channel = null;
    this.localBc = null;
    this.roomId = '';
    this.isConnected = false;
    this.vibrationEnabled = true;
    this.lastState = null;

    this.cacheDOM();
    this.initAudio();
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

    // Screens
    this.setupWaitScreen = document.getElementById('setup-wait-screen');
    this.gameplayScreen = document.getElementById('gameplay-conductor-screen');
    this.btnHostStartGame = document.getElementById('btn-host-start-game');

    // Contestant info
    this.hostAvatar = document.getElementById('host-contestant-avatar');
    this.hostName = document.getElementById('host-contestant-name');
    this.hostTierBadge = document.getElementById('host-tier-badge');
    this.hostBankTalentos = document.getElementById('host-bank-talentos');

    // Question
    this.hostQuestionText = document.getElementById('host-question-text');
    this.hostHintBox = document.getElementById('host-hint-box');
    this.hostHintText = document.getElementById('host-hint-text');

    // Options
    this.optButtons = [
      document.getElementById('host-opt-0'),
      document.getElementById('host-opt-1'),
      document.getElementById('host-opt-2'),
      document.getElementById('host-opt-3')
    ];

    this.optLabels = [
      document.getElementById('host-opt-label-0'),
      document.getElementById('host-opt-label-1'),
      document.getElementById('host-opt-label-2'),
      document.getElementById('host-opt-label-3')
    ];

    // Lifelines
    this.btnFifty = document.getElementById('host-life-fifty');
    this.btnSage = document.getElementById('host-life-sage');
    this.btnAudience = document.getElementById('host-life-audience');
    this.btnSwap = document.getElementById('host-life-swap');

    // Action buttons
    this.btnWalkaway = document.getElementById('host-btn-walkaway');
    this.btnContinue = document.getElementById('host-btn-continue');
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    } catch(e) {}
  }

  playClickSound(freq = 660, duration = 0.05) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch(e) {}
  }

  vibrate(pattern) {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  initSupabase() {
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_PUBLISHABLE_KEY) {
      this.supabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
      );
    } else {
      console.warn('Supabase not available, using BroadcastChannel.');
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

      this.syncChannel.on('trivia_state', (state) => {
        if (state) {
          this.isConnected = true;
          this.statusDot.classList.remove('offline');
          this.renderGameState(state);
        }
      });

      this.syncChannel.on('_network_connected', () => {
        this.isConnected = true;
        this.statusDot.classList.remove('offline');
        this.announceConnection();
      });
    }

    // Keep announcing connection every 1.2s until first game state is received
    this.startConnectingAnnouncements();
  }

  startConnectingAnnouncements() {
    clearInterval(this.announceInterval);
    this.announceConnection();
    this.announceInterval = setInterval(() => {
      if (this.lastState) {
        clearInterval(this.announceInterval);
        return;
      }
      this.announceConnection();
    }, 1200);
  }

  announceConnection() {
    if (this.syncChannel) {
      this.syncChannel.send('conductor_connected', { device: 'mobile_conductor', time: Date.now() });
    }
  }

  sendAction(action, data = {}) {
    this.playClickSound(800, 0.05);
    this.vibrate(35);

    if (this.syncChannel) {
      this.syncChannel.send('conductor_action', { action, ...data, time: Date.now() });
    }
  }

  renderGameState(state) {
    if (!state) return;
    this.lastState = state;
    this.statusDot.classList.remove('offline');

    // Phase: Setup vs Playing
    if (state.phase === 'setup') {
      this.setupWaitScreen.classList.remove('hidden');
      this.gameplayScreen.classList.add('hidden');
      return;
    }

    this.setupWaitScreen.classList.add('hidden');
    this.gameplayScreen.classList.remove('hidden');

    // Contestant info
    if (state.player) {
      this.hostName.textContent = state.player.name || 'JUGADOR 1';
      this.hostAvatar.textContent = state.player.avatar || '👨‍🚀';
      this.hostBankTalentos.textContent = (state.player.bank || 0).toLocaleString();
    }

    // Tier / Prize badge
    const curLevel = state.level || 1;
    const maxLevel = state.maxLevel || 15;
    const prizeAmount = state.prize?.amount ? state.prize.amount.toLocaleString() : '100';
    this.hostTierBadge.textContent = `PREGUNTA ${curLevel} DE ${maxLevel} • POR ${prizeAmount} TALENTOS`;

    // Question
    if (state.question) {
      this.hostQuestionText.textContent = state.question.text || 'Sin pregunta';
      if (state.question.hint) {
        this.hostHintBox.style.display = 'block';
        this.hostHintText.textContent = state.question.hint;
      } else {
        this.hostHintBox.style.display = 'none';
      }

      // Render 4 Options
      const options = state.question.options || [];
      const correctIdx = state.question.correct;
      const disabledOpts = new Set(state.disabledOptions || []);

      this.optButtons.forEach((btn, idx) => {
        if (!btn) return;
        const labelEl = this.optLabels[idx];
        const text = options[idx] || `Opción ${idx}`;
        if (labelEl) labelEl.textContent = text;

        // SECRET CORRECT ANSWER GUIDE FOR CONDUCTOR
        if (idx === correctIdx) {
          btn.classList.add('is-correct-guide');
        } else {
          btn.classList.remove('is-correct-guide');
        }

        // Disabled by 50:50 Lifeline
        if (disabledOpts.has(idx)) {
          btn.classList.add('disabled-lifeline');
        } else {
          btn.classList.remove('disabled-lifeline');
        }
      });
    }

    // Lifelines (Comodines)
    if (state.lifelines) {
      this.btnFifty.classList.toggle('used', !state.lifelines.fifty);
      this.btnSage.classList.toggle('used', !state.lifelines.sage);
      this.btnAudience.classList.toggle('used', !state.lifelines.audience);
      this.btnSwap.classList.toggle('used', !state.lifelines.swap);
    }

    // Modal Active Indicator
    if (state.modalActive) {
      this.btnContinue.style.boxShadow = '0 0 15px var(--color-green)';
      this.btnContinue.textContent = '⏭️ CONTINUAR (PULSAR PARA AVANZAR)';
    } else {
      this.btnContinue.style.boxShadow = '3px 3px 0 #000';
      this.btnContinue.textContent = '⏭️ CONTINUAR / SIGUIENTE TURNO';
    }
  }

  bindTouchAction(element, onPress) {
    if (!element) return;

    let isPressed = false;

    const handlePress = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      if (isPressed) return;
      isPressed = true;
      element.classList.add('pressed');
      onPress();
    };

    const handleRelease = (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      }
      isPressed = false;
      element.classList.remove('pressed');
    };

    // Modern pointer events with capture
    element.addEventListener('pointerdown', (e) => {
      try { element.setPointerCapture(e.pointerId); } catch(err){}
      handlePress(e);
    }, { passive: false });

    element.addEventListener('pointerup', (e) => {
      try { element.releasePointerCapture(e.pointerId); } catch(err){}
      handleRelease(e);
    }, { passive: false });

    element.addEventListener('pointercancel', (e) => {
      try { element.releasePointerCapture(e.pointerId); } catch(err){}
      handleRelease(e);
    }, { passive: false });

    element.addEventListener('touchstart', handlePress, { passive: false });
    element.addEventListener('touchend', handleRelease, { passive: false });
    element.addEventListener('touchcancel', handleRelease, { passive: false });

    element.addEventListener('click', (e) => {
      // Fallback for desktop clicks if pointer events weren't already captured
      if (!isPressed) onPress();
    });
  }

  bindControls() {
    // 4 Options [ A, B, C, D ]
    this.optButtons.forEach((btn, idx) => {
      this.bindTouchAction(btn, () => {
        this.sendAction('select_option', { optionIndex: idx });
      });
    });

    // Lifelines (Comodines)
    this.bindTouchAction(this.btnFifty, () => {
      this.sendAction('lifeline', { lifelineType: 'fifty' });
    });
    this.bindTouchAction(this.btnSage, () => {
      this.sendAction('lifeline', { lifelineType: 'sage' });
    });
    this.bindTouchAction(this.btnAudience, () => {
      this.sendAction('lifeline', { lifelineType: 'audience' });
    });
    this.bindTouchAction(this.btnSwap, () => {
      this.sendAction('lifeline', { lifelineType: 'swap' });
    });

    // Walk away / Plantarse
    this.bindTouchAction(this.btnWalkaway, () => {
      this.sendAction('walk_away');
    });

    // Continue / Next turn modal
    this.bindTouchAction(this.btnContinue, () => {
      this.sendAction('modal_continue');
    });

    // Start game from setup
    this.bindTouchAction(this.btnHostStartGame, () => {
      this.sendAction('start_game');
    });

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
  new TriviaConductorController();
});
