import { useEffect, useState, useRef } from 'react';
import { CATEGORIES, CategoryKey, Difficulty, DIFFICULTY_LABELS } from '../data/words';
import { Zap, Film, MapPin, Box, Sparkles, Loader2 } from 'lucide-react';

interface RouletteSlotProps {
  selectedCategory: CategoryKey;
  selectedDifficulty: Difficulty;
  onSpinComplete: () => void;
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
const ITEM_HEIGHT = 80; // height of each slot item in px
const VISIBLE_ITEMS = 3;
const LOOPS = 3; // number of times to loop the list for spinning animation

export function RouletteSlot({ selectedCategory, selectedDifficulty, onSpinComplete }: RouletteSlotProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);

  const targetIndex = CATEGORY_KEYS.indexOf(selectedCategory);
  const extendedItems = [
    ...Array(LOOPS).fill(CATEGORY_KEYS).flat(),
    ...CATEGORY_KEYS,
  ] as CategoryKey[];

  const finalIndex = LOOPS * CATEGORY_KEYS.length + targetIndex;

  // Sound effect / tick cue using Web Audio API
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Ignored if blocked
    }
  };

  useEffect(() => {
    let tickInterval: any;
    const delayTimeout = setTimeout(() => {
      setSpinning(true);
      
      // Simulate ticking sounds while spinning
      let currentTick = 0;
      tickInterval = setInterval(() => {
        if (currentTick < finalIndex) {
          playTickSound();
          currentTick++;
        } else {
          clearInterval(tickInterval);
        }
      }, 2800 / finalIndex);

      setOffsetY(finalIndex * ITEM_HEIGHT);

      const completionTimeout = setTimeout(() => {
        setDone(true);
        setTimeout(() => onSpinComplete(), 800);
      }, 3200);

      return () => {
        clearTimeout(completionTimeout);
        clearInterval(tickInterval);
      };
    }, 400);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(tickInterval);
    };
  }, [finalIndex, onSpinComplete]);

  const cat = CATEGORIES[selectedCategory];
  const diffColor =
    selectedDifficulty === 'easy'
      ? 'bg-emerald-600 border-emerald-950 text-white'
      : selectedDifficulty === 'medium'
      ? 'bg-amber-500 border-amber-950 text-white'
      : 'bg-red-600 border-red-950 text-white';

  const categoryIcons: Record<string, any> = {
    Zap,
    Film,
    MapPin,
    Box,
    Sparkles,
  };

  const SelectedIcon = categoryIcons[cat?.icon] || Sparkles;

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      <span className="text-xs font-black tracking-[0.25em] text-neutral-400 uppercase select-none animate-pulse">
        Sorteando Categoria...
      </span>

      {/* Slot Machine Window with Hard Shadow */}
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
        <div className="relative w-full bg-white border-4 border-neutral-950 rounded overflow-hidden select-none" style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}>
          
          {/* Center Target Marker */}
          <div className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2 border-y-4 border-violet-600 bg-violet-600/5 pointer-events-none z-10" />

          {/* Slots Reel */}
          <div
            className="flex flex-col transition-transform duration-[2800ms] ease-[cubic-bezier(0.1,0.6,0.1,1)]"
            style={{
              transform: `translateY(-${offsetY}px)`,
              // Shift the reel down so the selected item lands perfectly in the center item spot (the 2nd visible slot)
              marginTop: `${ITEM_HEIGHT}px`,
            }}
          >
            {extendedItems.map((key, i) => {
              const c = CATEGORIES[key];
              const SlotIcon = categoryIcons[c.icon] || Sparkles;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center gap-3 px-6 shrink-0"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-950" style={{ backgroundColor: c.color }} />
                  <SlotIcon className="w-6 h-6 text-neutral-800" />
                  <span className="text-2xl font-black text-neutral-900">{c.label}</span>
                </div>
              );
            })}
          </div>

          {/* Fade overlays for the slot top/bottom */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Spin result reveal box */}
      <div className="relative w-full max-w-sm min-h-[110px]">
        {done ? (
          <div className="animate-in fade-in zoom-in duration-300 relative">
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
            <div
              className="relative flex items-center gap-4 px-5 py-4 bg-white border-4 border-neutral-950 rounded"
              style={{ boxShadow: `inset 0 -4px 0 0 ${cat.color}20` }}
            >
              <div
                className="w-14 h-14 rounded border-2 border-neutral-950 flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#0a0a0a]"
                style={{ backgroundColor: cat.color }}
              >
                <SelectedIcon className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-2xl font-black text-neutral-900 leading-none">{cat.label}</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded border-2 border-neutral-950 ${diffColor} font-black text-xs uppercase tracking-wider self-start shadow-[1.5px_1.5px_0_0_#0a0a0a]`}>
                  <span>{DIFFICULTY_LABELS[selectedDifficulty]}</span>
                  <span className="bg-white/25 px-1.5 py-0.2 rounded">
                    +{selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 2 : 3} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-neutral-400 font-bold tracking-wider select-none">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {spinning ? 'GIRANDO ROLETTA...' : 'PREPARANDO ROLETTA...'}
          </div>
        )}
      </div>
    </div>
  );
}
