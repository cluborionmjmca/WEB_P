/**
 * ORIÓN ARCADE - REALTIME MULTI-TRANSPORT SYNC ENGINE (ORION-SYNC.JS)
 * IASD Pacajes - Ministerio Joven
 * 
 * Capas de conectividad:
 * 1. MQTT Seguro sobre WebSockets (broker.hivemq.com:8884 / broker.emqx.io:8084)
 *    -> Funciona entre CUALQUIER navegador, celular, PC, WiFi o datos móviles.
 * 2. WebRTC Peer-to-Peer directo vía PeerJS.
 * 3. BroadcastChannel y localStorage bus para pestañas del mismo navegador.
 */

(function(window) {
  'use strict';

  class OrionSyncChannel {
    constructor(roomCode, role = 'client') {
      this.roomCode = String(roomCode || '').trim().toUpperCase();
      this.role = role; // 'host' (pantalla PC) | 'client' (celular/mando)
      this.clientId = (role === 'host' ? 'host_' : 'pad_') + Math.random().toString(16).substring(2, 10);
      this.topic = `orion/pacajes/${this.roomCode}`;
      this.listeners = new Map();
      this.isConnected = false;
      this.remoteConnected = false;

      // Transport clients
      this.mqttClient = null;
      this.localBc = null;
      this.peer = null;
      this.peerConnections = [];

      this.initLocalBroadcast();
      this.initMqtt();
      this.initPeerJs();
    }

    /* ----------------------------------------------------
       1. HTML5 BroadcastChannel & localStorage (Local)
       ---------------------------------------------------- */
    initLocalBroadcast() {
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          this.localBc = new BroadcastChannel(`orion_bc_${this.roomCode}`);
          this.localBc.onmessage = (e) => {
            if (e.data && e.data.event) {
              this.dispatch(e.data.event, e.data.payload, 'localBc');
            }
          };
        }
      } catch (err) {
        console.warn('[OrionSync] BroadcastChannel not supported:', err);
      }

      // Storage event for windows of same origin
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('storage', (e) => {
          if (e.key === `orion_msg_${this.roomCode}` && e.newValue) {
            try {
              const data = JSON.parse(e.newValue);
              if (data && data.sender !== this.clientId) {
                this.dispatch(data.event, data.payload, 'storage');
              }
            } catch(err) {}
          }
        });
      }
    }

    /* ----------------------------------------------------
       2. MQTT sobre Secure WebSocket (Cross-browser / Phone)
       ---------------------------------------------------- */
    initMqtt() {
      if (typeof window.mqtt === 'undefined') {
        console.warn('[OrionSync] mqtt library not loaded, skipping MQTT layer.');
        return;
      }

      const brokerList = [
        'wss://broker.hivemq.com:8884/mqtt',
        'wss://broker.emqx.io:8084/mqtt'
      ];

      let brokerIndex = 0;

      const connectBroker = () => {
        const brokerUrl = brokerList[brokerIndex];
        console.log(`[OrionSync] Conectando a broker MQTT: ${brokerUrl}`);

        try {
          this.mqttClient = window.mqtt.connect(brokerUrl, {
            clientId: this.clientId + '_' + Math.random().toString(16).substring(2, 6),
            clean: true,
            connectTimeout: 7000,
            reconnectPeriod: 3000,
            keepalive: 30
          });

          this.mqttClient.on('connect', () => {
            this.isConnected = true;
            console.log(`[OrionSync] ¡Conectado al broker MQTT! Suscribiendo a ${this.topic}`);
            this.mqttClient.subscribe(this.topic, { qos: 0 }, (err) => {
              if (err) console.warn('[OrionSync] Error suscribiendo a topic:', err);
            });
            this.dispatch('_network_connected', { broker: brokerUrl });
          });

          this.mqttClient.on('message', (receivedTopic, messageBuffer) => {
            if (receivedTopic !== this.topic) return;
            try {
              const str = messageBuffer.toString();
              const data = JSON.parse(str);
              if (data && data.sender !== this.clientId && data.event) {
                this.dispatch(data.event, data.payload, 'mqtt');
              }
            } catch (err) {
              console.warn('[OrionSync] Error parseando mensaje MQTT:', err);
            }
          });

          this.mqttClient.on('error', (err) => {
            console.warn('[OrionSync] Error MQTT:', err?.message || err);
            // Intentar con broker de respaldo si falla
            brokerIndex = (brokerIndex + 1) % brokerList.length;
          });

          this.mqttClient.on('close', () => {
            this.isConnected = false;
          });

        } catch (err) {
          console.warn('[OrionSync] Excepción al inicializar MQTT:', err);
        }
      };

      connectBroker();
    }

    /* ----------------------------------------------------
       3. WebRTC Peer-to-Peer vía PeerJS (Direct P2P Data)
       ---------------------------------------------------- */
    initPeerJs() {
      if (typeof window.Peer === 'undefined') {
        return;
      }

      try {
        const cleanCode = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (this.role === 'host') {
          // El host registra un peer ID predecible
          const hostPeerId = `orion-room-${cleanCode}`;
          this.peer = new window.Peer(hostPeerId, {
            debug: 0,
            config: {
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            }
          });

          this.peer.on('connection', (conn) => {
            console.log('[OrionSync] ¡Celular conectado vía WebRTC Directo!');
            this.peerConnections.push(conn);

            conn.on('data', (data) => {
              if (data && data.event) {
                this.dispatch(data.event, data.payload, 'peerjs');
              }
            });

            conn.on('close', () => {
              this.peerConnections = this.peerConnections.filter(c => c !== conn);
            });
          });

          this.peer.on('error', (err) => {
            // Si el ID ya está tomado (por ejemplo por refresco rápido), no bloquear
            console.warn('[OrionSync] PeerJS Host warning:', err?.type || err);
          });

        } else {
          // El cliente (celular) se conecta al host
          const targetHostId = `orion-room-${cleanCode}`;
          this.peer = new window.Peer({
            debug: 0,
            config: {
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            }
          });

          this.peer.on('open', () => {
            const conn = this.peer.connect(targetHostId, { reliable: true });
            conn.on('open', () => {
              console.log('[OrionSync] ¡Conectado al Host vía WebRTC Directo!');
              this.peerConnections.push(conn);
              // Anunciar conexión inmediatamente por WebRTC
              conn.send({
                event: 'conductor_connected',
                payload: { device: 'mobile_controller', time: Date.now() },
                sender: this.clientId
              });
            });

            conn.on('data', (data) => {
              if (data && data.event) {
                this.dispatch(data.event, data.payload, 'peerjs');
              }
            });
          });
        }
      } catch (err) {
        console.warn('[OrionSync] PeerJS init exception:', err);
      }
    }

    /* ----------------------------------------------------
       4. Envío Multi-Capa (Multicast)
       ---------------------------------------------------- */
    send(event, payload = {}) {
      const messageObj = {
        event,
        payload,
        sender: this.clientId,
        time: Date.now()
      };

      const jsonStr = JSON.stringify(messageObj);

      // 1. MQTT a través de Internet
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(this.topic, jsonStr, { qos: 0 });
      }

      // 2. WebRTC Peer-to-Peer
      this.peerConnections.forEach((conn) => {
        try {
          if (conn.open) conn.send(messageObj);
        } catch (e) {}
      });

      // 3. BroadcastChannel local
      if (this.localBc) {
        try {
          this.localBc.postMessage(messageObj);
        } catch (e) {}
      }

      // 4. LocalStorage bus
      try {
        localStorage.setItem(`orion_msg_${this.roomCode}`, jsonStr);
      } catch (e) {}
    }

    /* ----------------------------------------------------
       5. Event Bus Listener
       ---------------------------------------------------- */
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      return this;
    }

    dispatch(event, payload, source = '') {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(cb => {
          try {
            cb(payload, source);
          } catch (err) {
            console.error(`[OrionSync] Error ejecutando listener para '${event}':`, err);
          }
        });
      }
    }

    destroy() {
      if (this.localBc) try { this.localBc.close(); } catch(e){}
      if (this.mqttClient) try { this.mqttClient.end(true); } catch(e){}
      if (this.peer) try { this.peer.destroy(); } catch(e){}
      this.peerConnections = [];
      this.listeners.clear();
    }
  }

  window.OrionSync = {
    createChannel: function(roomCode, role = 'client') {
      return new OrionSyncChannel(roomCode, role);
    }
  };

})(window);
