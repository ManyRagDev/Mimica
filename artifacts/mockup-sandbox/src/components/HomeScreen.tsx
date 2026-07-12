import { useGame } from '../context/GameContext';
import { Sparkles, Play, Plus, Users, Zap, Film, MapPin, Box } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: 'home' | 'setup' | 'game') => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { game, resetGame } = useGame();
  const hasGame = game.phase !== 'idle' && game.teams.length > 0;

  const features = [
    { label: '🎲  Roleta de Categorias', color: '#8B5CF6' },
    { label: '🔥  Batata Quente', color: '#EA580C' },
    { label: '🃏  Cartas Especiais', color: '#DB2777' },
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFCF0] flex flex-col justify-between overflow-hidden">
      
      {/* Decorative dot pattern background */}
      <div className="absolute inset-0 grid grid-cols-12 gap-6 p-8 opacity-[0.08] pointer-events-none select-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-neutral-950 rounded-full justify-self-center self-center" />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 pt-16 pb-12 flex-1 flex flex-col justify-between">
        
        {/* Branding Area */}
        <div className="flex flex-col gap-6">
          
          {/* Eyebrow Label */}
          <div className="flex items-center gap-2 self-start bg-neutral-950 px-3 py-1.5 rounded border-2 border-neutral-950 text-white font-black text-xs tracking-widest uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 border border-black animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-black animate-pulse" />
            <span>JOGO DE FESTA</span>
          </div>

          {/* Title Hero Block */}
          <div className="flex gap-4">
            {/* Visual accent vertical bar */}
            <div className="w-3.5 h-28 bg-amber-500 rounded border-2 border-neutral-950 shrink-0 shadow-[2px_2px_0_0_#000]" />
            <div className="flex flex-col text-left">
              <h1 className="text-6xl font-black text-neutral-950 tracking-tighter leading-[0.9]">
                MÍMICA
              </h1>
              <h1 className="text-6xl font-black text-violet-600 tracking-tighter leading-[0.9]">
                PARTY
              </h1>
            </div>
          </div>

          <p className="text-lg font-bold text-neutral-500 leading-relaxed text-left">
            O jogo de mímica definitivo para festas e encontros, cheio de reviravoltas divertidas!
          </p>

          {/* Core mechanics tags */}
          <div className="flex flex-col gap-2 mt-2">
            {features.map((f, i) => (
              <div key={i} className="relative self-start">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <div className="relative flex items-center px-4 py-2.5 bg-white border-2 border-neutral-950 rounded font-black text-sm text-neutral-900 shadow-sm">
                  <span>{f.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col gap-4 mt-12">
          
          {/* New Game Button */}
          <div className="relative w-full">
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
            <button
              onClick={() => {
                resetGame();
                onNavigate('setup');
              }}
              className="relative w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-lg tracking-wider py-4 px-6 border-4 border-neutral-950 rounded active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              <span>NOVO JOGO</span>
            </button>
          </div>

          {/* Resume Game Button */}
          {hasGame && (
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <button
                onClick={() => onNavigate('game')}
                className="relative w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-950 font-black text-base tracking-wider py-4 px-6 border-4 border-neutral-950 rounded active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-sm cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>CONTINUAR JOGO</span>
              </button>
            </div>
          )}

          {/* Social info banner */}
          <span className="text-xs font-bold tracking-wider text-neutral-400 mt-2 text-center select-none">
            Para 4 ou mais pessoas · Ideal para grupos
          </span>
        </div>
      </div>
    </div>
  );
}
