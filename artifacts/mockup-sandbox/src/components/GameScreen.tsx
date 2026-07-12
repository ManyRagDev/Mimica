import { useEffect, useState } from 'react';
import { useGame, Team } from '../context/GameContext';
import { CATEGORIES, MODIFIERS, DIFFICULTY_LABELS, DIFFICULTY_POINTS } from '../data/words';
import { Timer } from './Timer';
import { RouletteSlot } from './RouletteSlot';
import {
  Trophy,
  Sparkles,
  Timer as TimerIcon,
  ArrowRight,
  Shuffle,
  VolumeX,
  Users,
  User,
  Play,
  SkipForward,
  CheckCircle2,
  XCircle,
  Award,
  Crown,
  ChevronRight,
  Flame,
  AlertTriangle,
  Zap,
  Film,
  MapPin,
  Box
} from 'lucide-react';

interface GameScreenProps {
  onNavigate: (screen: 'home' | 'setup' | 'game') => void;
}

export function GameScreen({ onNavigate }: GameScreenProps) {
  const {
    game,
    proceedFromRoulette,
    proceedFromHotPotato,
    proceedFromModifier,
    skipWord,
    scorePoint,
    scoreError,
    nextTurn,
    nextRound,
    resetGame,
  } = useGame();

  const { phase, teams, currentTurn, round, turnsThisRound, settings, turnHistory } = game;

  // Active playing timer countdown state
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showConfirmQuit, setShowConfirmQuit] = useState(false);

  // Initialize timer whenever we transition to 'playing' phase
  useEffect(() => {
    if (phase === 'playing' && currentTurn) {
      setRemainingTime(currentTurn.timerSeconds);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
  }, [phase, currentTurn]);

  // Main countdown tick loop
  useEffect(() => {
    let interval: any;
    if (timerRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((t) => t - 1);
      }, 1000);
    } else if (remainingTime === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, remainingTime]);

  // Helper sound effect on score
  const playSfx = (type: 'success' | 'fail' | 'start') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(147, audioCtx.currentTime + 0.15); // D3
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      // Ignored if browser context block
    }
  };

  // Safe checks for rendering
  const activeTeam = currentTurn ? teams[currentTurn.teamIndex] : null;
  const activePlayer = activeTeam && currentTurn ? activeTeam.players[currentTurn.playerIndex] : null;
  const isTurbo = currentTurn?.modifier?.id === 'm4';

  const categoryIcons: Record<string, any> = {
    Zap,
    Film,
    MapPin,
    Box,
    Sparkles,
  };

  const modifierIcons: Record<string, any> = {
    Users,
    User,
    Shuffle,
    Timer: TimerIcon,
    VolumeX,
  };

  return (
    <div className="min-h-screen bg-[#FFFCF0] flex flex-col justify-between select-none">
      
      {/* Header Info Banner */}
      <header className="sticky top-0 bg-[#FFFCF0] border-b-4 border-neutral-950 flex items-center justify-between px-4 py-4 z-20">
        <div className="flex items-center gap-2">
          {activeTeam && (
            <div className="flex items-center gap-1.5 bg-neutral-950 text-white px-3 py-1 rounded border-2 border-neutral-950 text-xs font-black">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTeam.color }} />
              <span>RODADA {round}</span>
            </div>
          )}
        </div>

        <span className="font-black text-sm tracking-widest text-neutral-950 uppercase">
          MÍMICA PARTY
        </span>

        <button
          onClick={() => setShowConfirmQuit(true)}
          className="font-black text-xs text-red-600 border-2 border-red-200 hover:bg-red-50 px-3 py-1.5 rounded cursor-pointer transition-all"
        >
          DESISTIR
        </button>
      </header>

      {/* Main Container Stage wrapper */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 flex flex-col justify-center">
        
        {/* ================= PHASE: ROULETTE ================= */}
        {phase === 'roulette' && currentTurn && (
          <div className="space-y-6">
            <RouletteSlot
              selectedCategory={currentTurn.word.category}
              selectedDifficulty={currentTurn.word.difficulty}
              onSpinComplete={() => {
                // Done spinning automatically
              }}
            />

            {/* Bottom Proceed Action Button */}
            <div className="relative w-full max-w-sm mx-auto pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={() => {
                  playSfx('start');
                  proceedFromRoulette();
                }}
                className="relative w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>CONTINUAR</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE: HOT POTATO ================= */}
        {phase === 'hot-potato' && currentTurn && (
          <div className="space-y-6 text-center">
            
            {/* Hot potato banner */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-6 flex flex-col items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-full bg-red-600 border-2 border-neutral-950 flex items-center justify-center text-white shrink-0 animate-bounce shadow-[2px_2px_0_0_#000]">
                  <Flame className="w-10 h-10 fill-current" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-neutral-950 uppercase tracking-tighter leading-none">
                    BATATA QUENTE!
                  </h2>
                  <p className="text-sm font-bold text-neutral-400">
                    O mímico da rodada é surpresa!
                  </p>
                </div>

                <p className="text-sm font-semibold text-neutral-500 bg-red-50 border-2 border-red-200 rounded p-3 leading-relaxed">
                  Todos os integrantes do time fecham os olhos, exceto um. O mímico começa, mas ao final da rodada, a batata explode e escolhe um novo mímico aleatório!
                </p>
              </div>
            </div>

            {/* Iniciar Turno CTA */}
            <div className="relative w-full max-w-sm mx-auto pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={() => {
                  playSfx('start');
                  proceedFromHotPotato();
                }}
                className="relative w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>REVELAR CARTA</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE: MODIFIER REVEAL ================= */}
        {phase === 'modifier-reveal' && currentTurn && currentTurn.modifier && (
          <div className="space-y-6 text-center">
            
            {/* Card Reveal */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-6 flex flex-col items-center gap-6 text-left overflow-hidden">
                
                {/* Diagonal stripes on cards */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rotate-45 translate-x-10 -translate-y-10" />

                <div className="w-16 h-16 rounded border-2 border-neutral-950 bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#000]">
                  {/* Selected card modifier icon */}
                  {(() => {
                    const CardIcon = modifierIcons[currentTurn.modifier.icon] || Sparkles;
                    return <CardIcon className="w-10 h-10" />;
                  })()}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-black tracking-[0.2em] text-rose-600 uppercase">
                    CARTA DE MODIFICADOR
                  </span>
                  <h3 className="text-3xl font-black text-neutral-950 uppercase tracking-tighter leading-none">
                    {currentTurn.modifier.name}
                  </h3>
                </div>

                <p className="text-sm font-bold text-neutral-500 leading-relaxed bg-neutral-50 border-2 border-neutral-200 rounded p-4">
                  {currentTurn.modifier.description}
                </p>
              </div>
            </div>

            {/* Iniciar Turno CTA */}
            <div className="relative w-full max-w-sm mx-auto pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={() => {
                  playSfx('start');
                  proceedFromModifier();
                }}
                className="relative w-full py-4 bg-[#DB2777] hover:bg-[#C21A63] text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>COMEÇAR TURNO!</span>
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE: PLAYING ================= */}
        {phase === 'playing' && currentTurn && activeTeam && activePlayer && (
          <div className="space-y-6">
            
            {/* Active Turn Header Details Cards */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Team Indicator */}
              <div className="relative">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <div className="relative bg-white border-2 border-neutral-950 rounded p-3 text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTeam.color }} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">VEZ DA EQUIPE</span>
                  </div>
                  <span className="font-black text-lg text-neutral-950 truncate block">
                    {activeTeam.name}
                  </span>
                </div>
              </div>

              {/* Player Indicator */}
              <div className="relative">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <div className="relative bg-white border-2 border-neutral-950 rounded p-3 text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">QUEM MIMA</span>
                  </div>
                  <span className="font-black text-lg text-neutral-950 truncate block">
                    {activePlayer.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Central Round Play Target Word Card */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-6 flex flex-col items-center gap-5 text-center">
                
                {/* Active Category badge */}
                {(() => {
                  const cat = CATEGORIES[currentTurn.word.category];
                  const CatIcon = categoryIcons[cat?.icon] || Sparkles;
                  return (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-neutral-950 text-white font-black text-xs uppercase shadow-[1px_1px_0_0_#000]"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CatIcon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </div>
                  );
                })()}

                {/* Main Mystery Mime Target Word Word */}
                <div className="py-2">
                  <h2 className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-tight leading-none uppercase">
                    {currentTurn.word.term}
                  </h2>
                </div>

                {/* Tags bottom info row */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-400">
                    Dificuldade: <span className="text-neutral-700 font-extrabold uppercase">{DIFFICULTY_LABELS[currentTurn.word.difficulty]}</span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="text-xs font-bold text-neutral-400">
                    Vale: <span className="text-violet-600 font-black">+{currentTurn.pointValue} pts</span>
                  </span>
                </div>

                {/* Modifiers badge bottom if active */}
                {currentTurn.modifier && (
                  <div className="flex items-center gap-1.5 bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-xs font-bold leading-relaxed w-full justify-center">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Modificador Ativo: <strong>{currentTurn.modifier.name}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown Tick Element */}
            <Timer
              totalSeconds={currentTurn.timerSeconds}
              remainingSeconds={remainingTime}
              running={timerRunning}
              onExpire={() => {
                playSfx('fail');
                scoreError();
              }}
            />

            {/* Playing Decision CTAs Buttons Panel */}
            <div className="flex gap-4 pt-4">
              
              {/* Skip word button */}
              <div className="relative flex-1">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <button
                  onClick={skipWord}
                  className="relative w-full py-4 px-3 bg-white hover:bg-neutral-50 border-2 border-neutral-950 rounded font-black text-sm text-neutral-700 flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 stroke-[2.5]" />
                  <span>PULAR TERMO</span>
                </button>
              </div>

              {/* Errou / tempo esgotou button */}
              <div className="relative flex-1">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <button
                  onClick={() => {
                    playSfx('fail');
                    scoreError();
                  }}
                  className="relative w-full py-4 px-3 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-neutral-950 rounded font-black text-sm flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>ERROU!</span>
                </button>
              </div>

              {/* Score point button */}
              <div className="relative flex-[1.5]">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                <button
                  onClick={() => {
                    playSfx('success');
                    scorePoint();
                  }}
                  className="relative w-full py-4 px-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-neutral-950 rounded font-black text-sm flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>ADIVINHOU!</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PHASE: TURN END ================= */}
        {phase === 'turn-end' && currentTurn && activeTeam && (
          <div className="space-y-6 text-center">
            
            {/* Overview Box */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-6 flex flex-col items-center gap-4 text-left">
                {currentTurn.result === 'point' ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 border-2 border-neutral-950 flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#000] animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-600 border-2 border-neutral-950 flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#000] animate-pulse">
                    <XCircle className="w-10 h-10" />
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-neutral-950 uppercase tracking-tighter leading-none">
                    {currentTurn.result === 'point' ? 'PONTO MARCADO!' : 'FIM DO TEMPO!'}
                  </h3>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Termo: <strong className="text-neutral-800">{currentTurn.word.term}</strong>
                  </p>
                </div>

                <div className="w-full border-t-2 border-neutral-100 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-neutral-400">Equipe</span>
                    <span className="text-neutral-800" style={{ color: activeTeam.color }}>{activeTeam.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-neutral-400">Mímico</span>
                    <span className="text-neutral-800">{activePlayer?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-neutral-400">Ganhos</span>
                    <span className="font-extrabold text-violet-600">
                      {currentTurn.result === 'point' ? `+${currentTurn.pointValue} pontos` : '0 pontos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next turn CTA */}
            <div className="relative w-full max-w-sm mx-auto pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={nextTurn}
                className="relative w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>PRÓXIMO TURNO</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE: ROUND END ================= */}
        {phase === 'round-end' && (
          <div className="space-y-6 text-left">
            
            {/* Header info */}
            <div className="text-center space-y-1.5">
              <Award className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
              <h2 className="text-3xl font-black text-neutral-950 tracking-tighter uppercase leading-none">
                RODADA COMPLETADA!
              </h2>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Classificação Parcial
              </span>
            </div>

            {/* Dynamic Standings Table */}
            <div className="space-y-4">
              {teams.map((t, idx) => (
                <div key={t.id} className="relative w-full">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                  <div className="relative bg-white border-2 border-neutral-950 rounded p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-2xl text-neutral-900 w-6">#{idx + 1}</span>
                      <div className="w-3 h-10 rounded" style={{ backgroundColor: t.color }} />
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-neutral-950">{t.name}</span>
                        <span className="text-xs font-bold text-neutral-400">Alvo do jogo: {settings.targetScore} pts</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-black text-3xl text-neutral-950 leading-none">{t.score}</span>
                      <span className="text-[10px] font-black tracking-wider uppercase text-violet-600">Pontos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Turn History Scroll */}
            <div className="relative w-full pt-4">
              <span className="text-xs font-black tracking-widest text-neutral-400 uppercase block mb-3">
                Histórico do Jogo
              </span>
              <div className="bg-white border-2 border-neutral-200 rounded divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                {turnHistory.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teams[rec.teamIndex]?.color }} />
                      <span className="text-neutral-500 font-medium"><strong>{rec.playerName}</strong> fez <em>"{rec.wordTerm}"</em></span>
                    </div>
                    {rec.result === 'point' ? (
                      <span className="text-emerald-600 font-extrabold shrink-0">+{rec.points} pts</span>
                    ) : (
                      <span className="text-red-500 font-extrabold shrink-0">✕ Errou</span>
                    )}
                  </div>
                ))}

                {turnHistory.length === 0 && (
                  <div className="py-6 text-center text-neutral-400 font-semibold">
                    Nenhum turno registrado neste round.
                  </div>
                )}
              </div>
            </div>

            {/* Next Round CTA */}
            <div className="relative w-full pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={nextRound}
                className="relative w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>INICIAR NOVA RODADA</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE: GAME END ================= */}
        {phase === 'game-end' && (
          <div className="space-y-6 text-center">
            
            {/* Grand Winner Card */}
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-6 flex flex-col items-center gap-5 text-left overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rotate-45 translate-x-10 -translate-y-10 animate-pulse" />

                <div className="w-20 h-20 rounded-full bg-amber-500 border-2 border-neutral-950 flex items-center justify-center text-neutral-950 shrink-0 animate-bounce shadow-[2px_2px_0_0_#000]">
                  <Crown className="w-12 h-12 fill-current" />
                </div>

                <div className="space-y-1 text-center w-full">
                  <span className="text-xs font-black tracking-[0.25em] text-amber-500 uppercase">
                    CAMPEÃO DO DIA!
                  </span>
                  
                  {/* Find team with highest score */}
                  {(() => {
                    const winnerTeam = [...teams].sort((a, b) => b.score - a.score)[0];
                    return (
                      <h2
                        className="text-4xl font-black uppercase tracking-tighter leading-none"
                        style={{ color: winnerTeam?.color || '#D97706' }}
                      >
                        {winnerTeam?.name || 'VITÓRIA!'}
                      </h2>
                    );
                  })()}
                </div>

                <div className="w-full border-t-2 border-neutral-100 pt-4 space-y-3">
                  <h4 className="text-xs font-black tracking-widest text-neutral-400 uppercase">
                    Placar Final
                  </h4>
                  {[...teams]
                    .sort((a, b) => b.score - a.score)
                    .map((team, idx) => (
                      <div key={team.id} className="flex items-center justify-between text-sm font-black">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 w-4">#{idx + 1}</span>
                          <span style={{ color: team.color }}>{team.name}</span>
                        </div>
                        <span className="text-neutral-900 text-base">{team.score} pontos</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Back to Home CTA */}
            <div className="relative w-full max-w-sm mx-auto pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={() => {
                  resetGame();
                  onNavigate('home');
                }}
                className="relative w-full py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-lg tracking-widest border-3 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>VOLTAR AO INÍCIO</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Decorative safety bottom footer pad */}
      <footer className="py-4 text-center text-xs font-bold text-neutral-400 select-none">
        Mímica Party Web Edition
      </footer>

      {/* Custom Quit Confirmation Modal Overlay */}
      {showConfirmQuit && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-neutral-950 rounded" />
            <div className="relative bg-[#FFFCF0] border-4 border-neutral-950 rounded p-6 space-y-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce text-red-600" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">DESISTIR?</h3>
              </div>
              <p className="text-sm font-bold text-neutral-500 leading-relaxed text-left">
                Deseja mesmo sair e reiniciar o jogo? Todo o progresso da partida atual será perdido definitivamente.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmQuit(false)}
                  className="flex-1 py-3 bg-white hover:bg-neutral-50 border-2 border-neutral-950 rounded font-black text-sm text-neutral-700 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  VOLTAR
                </button>
                <button
                  onClick={() => {
                    resetGame();
                    onNavigate('home');
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white border-2 border-neutral-950 rounded font-black text-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  DESISTIR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
