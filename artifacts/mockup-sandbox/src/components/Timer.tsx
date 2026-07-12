import { useEffect } from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';

interface TimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  running: boolean;
  onExpire: () => void;
}

export function Timer({ totalSeconds, remainingSeconds, running, onExpire }: TimerProps) {
  const percentage = (remainingSeconds / totalSeconds) * 100;
  const isLow = remainingSeconds <= 10;

  // Sound effect / beep simulation using Web Audio API
  useEffect(() => {
    if (running && isLow && remainingSeconds > 0) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        // Pitch goes higher as time runs lower!
        oscillator.frequency.setValueAtTime(remainingSeconds <= 3 ? 1200 : 880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // Fallback if browser audio context is blocked
      }
    }
  }, [remainingSeconds, running, isLow]);

  useEffect(() => {
    if (remainingSeconds === 0 && running) {
      onExpire();
    }
  }, [remainingSeconds, running, onExpire]);

  // Circular progress math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Timer Container with Hard Shadow */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded-full" />
        <div className="absolute inset-0 bg-white border-4 border-neutral-950 rounded-full flex items-center justify-center overflow-hidden">
          {/* Circular Track */}
          <svg className="absolute -rotate-90 w-full h-full scale-95">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-neutral-100"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              style={{ strokeDasharray: circumference, strokeDashoffset }}
              className={`transition-all duration-1000 ease-linear ${
                isLow ? 'stroke-red-500' : 'stroke-violet-600'
              }`}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="relative z-10 flex flex-col items-center select-none">
            {isLow ? (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
            ) : (
              <TimerIcon className={`w-5 h-5 ${running ? 'animate-pulse text-violet-600' : 'text-neutral-400'}`} />
            )}
            <span
              className={`text-4xl font-mono font-bold tracking-tighter ${
                isLow ? 'text-red-500 animate-pulse' : 'text-neutral-900'
              }`}
            >
              {remainingSeconds}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {running ? 'Segundos' : 'Pausado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
