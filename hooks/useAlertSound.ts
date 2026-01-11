'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { AlertPriority } from '@/lib/supabase';

// Sound frequencies for different alert types (in Hz)
const ALERT_FREQUENCIES = {
  critical: [880, 660, 880, 660], // High-low-high-low pattern
  high: [660, 440, 660], // Medium urgency pattern
  medium: [440, 330], // Lower urgency pattern
};

// Sound durations (in ms)
const ALERT_DURATIONS = {
  critical: 200,
  high: 250,
  medium: 300,
};

interface AlertSoundOptions {
  enabled?: boolean;
  volume?: number; // 0 to 1
  criticalOnly?: boolean;
}

export function useAlertSound(options: AlertSoundOptions = {}) {
  const { enabled = true, volume = 0.5, criticalOnly = false } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Initialize AudioContext on first interaction
  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setIsSupported(true);
      } catch (e) {
        console.error('AudioContext not supported:', e);
        setIsSupported(false);
      }
    }

    // Resume context if suspended (required for user interaction)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Play a tone at a specific frequency
  const playTone = useCallback((frequency: number, duration: number, startTime: number) => {
    if (!audioContextRef.current || isMuted || !enabled) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Set volume
    gainNode.gain.value = volume;

    // Fade out at the end to prevent clicking
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
  }, [enabled, isMuted, volume]);

  // Play alert sound for a given priority
  const playAlertSound = useCallback((priority: AlertPriority) => {
    if (!enabled || isMuted) return;
    if (criticalOnly && priority !== 'critical') return;

    // Debounce - don't play if played within last 2 seconds
    const now = Date.now();
    if (now - lastPlayedRef.current < 2000) return;
    lastPlayedRef.current = now;

    // Initialize audio context if needed
    initAudio();

    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const frequencies = ALERT_FREQUENCIES[priority as keyof typeof ALERT_FREQUENCIES] || ALERT_FREQUENCIES.medium;
    const duration = ALERT_DURATIONS[priority as keyof typeof ALERT_DURATIONS] || ALERT_DURATIONS.medium;

    let startTime = ctx.currentTime;

    // Play each frequency in sequence
    frequencies.forEach((freq) => {
      playTone(freq, duration, startTime);
      startTime += duration / 1000 + 0.05; // Small gap between tones
    });
  }, [enabled, isMuted, criticalOnly, initAudio, playTone]);

  // Play critical alert with speech synthesis
  const playCriticalAlert = useCallback((message?: string) => {
    if (!enabled || isMuted) return;

    // Play tone
    playAlertSound('critical');

    // Speak the message using Web Speech API
    if (message && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.2;
      utterance.pitch = 1;
      utterance.volume = volume;

      // Wait for tone to finish, then speak
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 1000);
    }
  }, [enabled, isMuted, volume, playAlertSound]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Test sound
  const testSound = useCallback(() => {
    initAudio();
    playAlertSound('high');
  }, [initAudio, playAlertSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize on user interaction
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleInteraction = () => {
      initAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [initAudio]);

  return {
    playAlertSound,
    playCriticalAlert,
    toggleMute,
    testSound,
    isMuted,
    isSupported,
  };
}

// Hook to auto-play sounds when new alerts arrive
export function useAlertSoundNotifications(
  alerts: Array<{ id: string; priority: AlertPriority; status: string }>,
  options: AlertSoundOptions = {}
) {
  const { playAlertSound, playCriticalAlert, ...rest } = useAlertSound(options);
  const previousAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(alerts.map(a => a.id));

    // Find new alerts
    alerts.forEach(alert => {
      if (!previousAlertsRef.current.has(alert.id) && alert.status === 'active') {
        // New active alert
        if (alert.priority === 'critical') {
          playCriticalAlert('Critical emergency alert received');
        } else if (alert.priority === 'high') {
          playAlertSound('high');
        }
      }
    });

    // Update previous alerts
    previousAlertsRef.current = currentIds;
  }, [alerts, playAlertSound, playCriticalAlert]);

  return { playAlertSound, playCriticalAlert, ...rest };
}
