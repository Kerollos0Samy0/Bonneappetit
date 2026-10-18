// Order Sound & Desktop Notification System for Bonne Appetit
// Designed for loud restaurant/POS alerts with zero external file dependencies.

let sharedAudioCtx = null;

function getAudioContext() {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Prime the audio context on first user interaction so future order notifications can play without restrictions
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Plays a loud, distinctive multi-tone restaurant POS chime using Web Audio API.
 * Uses dual-harmonic oscillators and a master volume booster so it cuts through ambient noise.
 */
export function playLoudOrderAlert() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Master booster
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.2, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const playBellTone = (freq, startTime, duration = 0.35, vol = 1.0) => {
      // Primary bright tone (triangle)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);
      gain1.gain.setValueAtTime(vol, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(startTime);
      osc1.stop(startTime + duration);

      // Resonant harmonic chime (sine at octave for singing bell brilliance)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime);
      gain2.gain.setValueAtTime(vol * 0.45, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.7));
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(startTime);
      osc2.stop(startTime + duration);
    };

    const now = ctx.currentTime + 0.05;

    // Pattern 1: High energetic POS restaurant chime (C6 -> E6 -> G6 -> C7)
    playBellTone(1046.5, now, 0.22, 1.0);          // C6
    playBellTone(1318.5, now + 0.18, 0.22, 1.0);   // E6
    playBellTone(1567.98, now + 0.36, 0.25, 1.0);  // G6
    playBellTone(2093.0, now + 0.55, 0.65, 1.1);   // C7 (long high chime)

    // Pattern 2: Second attention-grabbing burst
    playBellTone(1046.5, now + 0.95, 0.22, 1.0);
    playBellTone(1318.5, now + 1.13, 0.22, 1.0);
    playBellTone(1567.98, now + 1.31, 0.25, 1.0);
    playBellTone(2093.0, now + 1.50, 0.85, 1.2);

    // Final celebratory restaurant bell
    playBellTone(2637.0, now + 1.95, 0.95, 1.0);   // E7 resonant bell
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}

/**
 * Checks current notification permission status ('granted' | 'denied' | 'default' | 'unsupported')
 */
export function getNotificationPermissionStatus() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'unsupported';
}

/**
 * Requests browser permission for desktop notifications
 */
export function requestDesktopNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }
    return Promise.resolve(Notification.permission);
  }
  return Promise.resolve('unsupported');
}

/**
 * Sends a native Desktop Notification to Windows/Mac/Mobile
 */
export function sendDesktopNotification(order) {
  if (!order || typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const title = '🔔 أوردر جديد وارد الآن - بونابيتي!';
      const body = `العميل: ${order.clientName || 'عميل'}\nالمبلغ: ${order.totalAmount || 0} ج.م | الوزن: ${order.totalWeight || 0} كجم\nالأصناف: ${order.itemsSummary || 'وجبات طازجة'}`;

      const notification = new Notification(title, {
        body,
        icon: '/images/logo.png',
        tag: 'order-' + (order.id || Date.now()),
        requireInteraction: true // Stays visible until user clicks or dismisses it
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn("Could not display native notification:", e);
    }
  }
}

