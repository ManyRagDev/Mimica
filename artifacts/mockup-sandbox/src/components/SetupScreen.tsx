import { useState } from 'react';
import { useGame, Team, Player, GameSettings } from '../context/GameContext';
import { CATEGORIES, CategoryKey } from '../data/words';
import { ChevronLeft, Plus, X, Check, Clock, Award, Shield, Users, Layers, Settings, HelpCircle, Flame, Sparkles, Play, Zap, Film, MapPin, Box } from 'lucide-react';

interface SetupScreenProps {
  onNavigate: (screen: 'home' | 'setup' | 'game') => void;
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
const TEAM_COLORS = ['#6D28D9', '#D97706', '#059669', '#DB2777', '#2563EB', '#DC2626'];

const categoryIcons: Record<string, any> = {
  Zap,
  Film,
  MapPin,
  Box,
  Sparkles,
};

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 8);
}

export function SetupScreen({ onNavigate }: SetupScreenProps) {
  const { startGame } = useGame();

  const [teams, setTeams] = useState<Team[]>([
    {
      id: 't1',
      name: 'Time 1',
      color: TEAM_COLORS[0],
      players: [],
      score: 0,
    },
    {
      id: 't2',
      name: 'Time 2',
      color: TEAM_COLORS[1],
      players: [],
      score: 0,
    },
  ]);

  const [newPlayerNames, setNewPlayerNames] = useState<string[]>(['', '']);
  const [activeTab, setActiveTab] = useState<'equipes' | 'regras' | 'pacotes'>('equipes');

  const [settings, setSettings] = useState<GameSettings>({
    timerSeconds: 60,
    timerMode: 'fixed',
    playerOrder: 'sequential',
    selectedCategories: CATEGORY_KEYS,
    enableRoulette: true,
    enableHotPotato: false,
    enableModifiers: false,
    enableSabotage: false,
    targetScore: 15,
    difficulty: 'all',
  });

  function addPlayer(teamIdx: number) {
    const name = newPlayerNames[teamIdx].trim();
    if (!name) return;

    const newPlayer: Player = { id: generateId(), name };
    setTeams((prev) =>
      prev.map((t, i) => (i === teamIdx ? { ...t, players: [...t.players, newPlayer] } : t))
    );
    setNewPlayerNames((prev) => prev.map((n, i) => (i === teamIdx ? '' : n)));
  }

  function removePlayer(teamIdx: number, playerId: string) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx ? { ...t, players: t.players.filter((p) => p.id !== playerId) } : t
      )
    );
  }

  function toggleCategory(cat: CategoryKey) {
    setSettings((s) => {
      const already = s.selectedCategories.includes(cat);
      if (already && s.selectedCategories.length === 1) return s;
      return {
        ...s,
        selectedCategories: already
          ? s.selectedCategories.filter((c) => c !== cat)
          : [...s.selectedCategories, cat],
      };
    });
  }

  function handleStart() {
    const minPlayers = Math.min(...teams.map((t) => t.players.length));
    if (minPlayers === 0) {
      alert('Ops! Adicione pelo menos 1 jogador em cada time.');
      return;
    }

    startGame(teams, settings);
    onNavigate('game');
  }

  const TABS = [
    { key: 'equipes' as const, label: 'Equipes', icon: Users },
    { key: 'regras' as const, label: 'Regras', icon: Settings },
    { key: 'pacotes' as const, label: 'Pacotes', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF0] flex flex-col select-none">
      
      {/* Upper Navigation Header */}
      <header className="sticky top-0 bg-[#FFFCF0] border-b-4 border-neutral-950 flex items-center justify-between px-4 py-4 z-20">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 font-black text-xs tracking-wider text-neutral-950 hover:bg-neutral-100 p-2 border-2 border-transparent rounded cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[3]" />
          <span>VOLTAR</span>
        </button>

        <span className="font-black text-base tracking-widest text-neutral-950 uppercase">
          CONFIGURAR JOGO
        </span>

        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Tabs Layout with Thick Borders */}
      <div className="flex border-b-4 border-neutral-950 bg-white">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-black text-xs tracking-widest uppercase transition-all border-r-2 last:border-r-0 border-neutral-950 cursor-pointer ${
                isActive ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <TabIcon className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Form Scroll View */}
      <main className="flex-1 overflow-y-auto max-w-lg w-full mx-auto p-4 pb-28 space-y-6">
        
        {/* TAB 1: EQUIPES */}
        {activeTab === 'equipes' && (
          <>
            {teams.map((team, teamIdx) => (
              <div key={team.id} className="relative w-full">
                {/* Outer Shadow */}
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
                {/* Card Base */}
                <div className="relative bg-white border-4 border-neutral-950 rounded overflow-hidden">
                  {/* Team top color strip */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b-4 border-neutral-950 text-white"
                    style={{ backgroundColor: team.color }}
                  >
                    <span className="font-black text-lg tracking-widest uppercase">{team.name}</span>
                    <span className="font-black text-xs uppercase opacity-90">
                      {team.players.length} JOGADOR(ES)
                    </span>
                  </div>

                  {/* Player List */}
                  <div className="divide-y-2 divide-neutral-100 bg-white">
                    {team.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                          <span className="font-bold text-neutral-800">{player.name}</span>
                        </div>
                        <button
                          onClick={() => removePlayer(teamIdx, player.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 rounded-full hover:bg-neutral-100 transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    ))}

                    {team.players.length === 0 && (
                      <div className="px-4 py-4 text-center text-sm font-bold text-neutral-400 select-none">
                        Nenhum jogador adicionado
                      </div>
                    )}
                  </div>

                  {/* Add player box */}
                  <div className="p-3 border-t-2 border-neutral-950 bg-[#FFFCF0] flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar jogador"
                      value={newPlayerNames[teamIdx] || ''}
                      onChange={(e) =>
                        setNewPlayerNames((prev) => {
                          const next = [...prev];
                          next[teamIdx] = e.target.value;
                          return next;
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addPlayer(teamIdx);
                      }}
                      className="flex-1 px-4 py-2 border-2 border-neutral-950 rounded bg-white text-neutral-950 font-bold focus:outline-none"
                    />
                    <div className="relative">
                      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 rounded" />
                      <button
                        onClick={() => addPlayer(teamIdx)}
                        className="relative w-10 h-10 flex items-center justify-center text-white border-2 border-neutral-950 rounded hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        style={{ backgroundColor: team.color }}
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Team Button */}
            <div className="relative w-full pt-2">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <button
                onClick={() => {
                  if (teams.length >= TEAM_COLORS.length) {
                    alert('Número máximo de times atingido!');
                    return;
                  }
                  const newTeamId = generateId();
                  const newColor = TEAM_COLORS[teams.length];
                  setTeams(prev => [...prev, {
                    id: newTeamId,
                    name: `Time ${teams.length + 1}`,
                    color: newColor,
                    players: [],
                    score: 0,
                  }]);
                  setNewPlayerNames(prev => [...prev, '']);
                }}
                className="relative w-full py-4 bg-white hover:bg-neutral-50 border-4 border-dashed border-neutral-950 rounded font-black text-sm text-neutral-950 text-center cursor-pointer transition-all uppercase tracking-widest"
              >
                + Adicionar Time
              </button>
            </div>
          </>
        )}

        {/* TAB 2: REGRAS */}
        {activeTab === 'regras' && (
          <div className="space-y-6 text-left">
            
            {/* Round Timer Block */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-950 pb-2 mb-2">
                  <Clock className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="font-black text-xs tracking-wider uppercase">TEMPO POR TURNO</span>
                </div>

                {/* Preset Options */}
                <div className="flex flex-wrap gap-2">
                  {[30, 45, 60, 90].map((s) => {
                    const isSelected = settings.timerSeconds === s;
                    return (
                      <div key={s} className="relative">
                        {isSelected && <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 rounded" />}
                        <button
                          onClick={() => setSettings((prev) => ({ ...prev, timerSeconds: s }))}
                          className={`relative px-4 py-2 font-black text-sm border-2 border-neutral-950 rounded active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all ${
                            isSelected ? 'bg-violet-600 text-white' : 'bg-white text-neutral-950 hover:bg-neutral-50'
                          }`}
                        >
                          {s}s
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Decreasing Timer Option */}
                <label className="flex items-center justify-between pt-2 border-t-2 border-neutral-100 cursor-pointer">
                  <div className="flex flex-col gap-0.5 pr-4 select-none">
                    <span className="font-bold text-neutral-900 text-sm">Tempo Decrescente</span>
                    <span className="text-xs text-neutral-400">O tempo diminui a cada nova rodada</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.timerMode === 'decreasing'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timerMode: e.target.checked ? 'decreasing' : 'fixed',
                      }))
                    }
                    className="w-10 h-6 bg-neutral-200 rounded-full appearance-none border-2 border-neutral-950 relative cursor-pointer checked:bg-violet-600 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-neutral-950 before:rounded-full before:transition-all checked:before:translate-x-4"
                  />
                </label>
              </div>
            </div>

            {/* Target Score Block */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-950 pb-2 mb-2">
                  <Award className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="font-black text-xs tracking-wider uppercase">PONTUAÇÃO ALVO</span>
                </div>

                {/* Preset Options */}
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 30].map((pt) => {
                    const isSelected = settings.targetScore === pt;
                    return (
                      <div key={pt} className="relative">
                        {isSelected && <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 rounded" />}
                        <button
                          onClick={() => setSettings((prev) => ({ ...prev, targetScore: pt }))}
                          className={`relative px-4 py-2 font-black text-sm border-2 border-neutral-950 rounded active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-white text-neutral-950 hover:bg-neutral-50'
                          }`}
                        >
                          {pt} pts
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Difficulty Settings Block */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-950 pb-2 mb-2">
                  <Layers className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="font-black text-xs tracking-wider uppercase">DIFICULDADE DAS PALAVRAS</span>
                </div>

                {/* Preset Options */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all' as const, label: 'Aleatório' },
                    { key: 'easy' as const, label: 'Fácil' },
                    { key: 'medium' as const, label: 'Médio' },
                    { key: 'hard' as const, label: 'Difícil' },
                  ].map((diff) => {
                    const isSelected = settings.difficulty === diff.key;
                    return (
                      <div key={diff.key} className="relative">
                        {isSelected && <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 rounded" />}
                        <button
                          onClick={() => setSettings((prev) => ({ ...prev, difficulty: diff.key }))}
                          className={`relative px-4 py-2 font-black text-sm border-2 border-neutral-950 rounded active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all ${
                            isSelected ? 'bg-violet-600 text-white' : 'bg-white text-neutral-950 hover:bg-neutral-50'
                          }`}
                        >
                          {diff.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Settings Block */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-950 pb-2 mb-2">
                  <Shield className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="font-black text-xs tracking-wider uppercase">ORDEM DO TIME</span>
                </div>

                <div className="flex gap-4">
                  {[
                    { key: 'sequential' as const, label: 'Sequencial (Ordem de adição)' },
                    { key: 'random' as const, label: 'Aleatório (Sorteado na hora)' },
                  ].map((o) => {
                    const isSelected = settings.playerOrder === o.key;
                    return (
                      <label
                        key={o.key}
                        onClick={() => setSettings((prev) => ({ ...prev, playerOrder: o.key }))}
                        className={`flex-1 flex items-center gap-2.5 p-3 rounded border-2 border-neutral-950 bg-white hover:bg-neutral-50 cursor-pointer select-none ${
                          isSelected ? 'ring-2 ring-violet-600 ring-offset-2' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="playerOrder"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 border-2 border-neutral-950 text-violet-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-xs text-neutral-800 leading-tight">
                          {o.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Special Modes Block */}
            <div className="relative w-full">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
              <div className="relative bg-white border-4 border-neutral-950 rounded p-4 space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-950 pb-2 mb-2">
                  <Sparkles className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                  <span className="font-black text-xs tracking-wider uppercase">REGRAS DE PARTIDA</span>
                </div>

                {/* Checkboxes List */}
                <div className="space-y-4 divide-y-2 divide-neutral-100">
                  {[
                    {
                      key: 'enableRoulette' as const,
                      label: '🎲  Roleta de Categorias',
                      desc: 'Gira uma roleta no início de cada turno para sortear o tema',
                    },
                    {
                      key: 'enableHotPotato' as const,
                      label: '🔥  Batata Quente',
                      desc: 'O mímico da rodada é revelado no último segundo, todos jogam!',
                    },
                    {
                      key: 'enableModifiers' as const,
                      label: '🃏  Cartas Modificadoras',
                      desc: 'Modificadores aleatórios (Silêncio, Turbo, Estátua) afetam os turnos',
                    },
                  ].map((mode, idx) => (
                    <label
                      key={mode.key}
                      className={`flex items-start justify-between cursor-pointer select-none ${
                        idx > 0 ? 'pt-4' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 pr-4">
                        <span className="font-bold text-sm text-neutral-900">{mode.label}</span>
                        <span className="text-xs text-neutral-400 leading-relaxed">{mode.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[mode.key]}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, [mode.key]: e.target.checked }))
                        }
                        className="w-10 h-6 bg-neutral-200 rounded-full appearance-none border-2 border-neutral-950 relative cursor-pointer checked:bg-violet-600 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:bg-neutral-950 before:rounded-full before:transition-all checked:before:translate-x-4 shrink-0 mt-0.5"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACOTES */}
        {activeTab === 'pacotes' && (
          <div className="space-y-4 text-left">
            <p className="text-sm font-bold text-neutral-500 bg-white/50 border-2 border-neutral-200 rounded p-3 leading-relaxed">
              Escolha quais categorias de mímica farão parte do pool de termos sorteados.
              Mantenha pelo menos uma ativa para jogar.
            </p>

            {/* Categories Selection Cards */}
            {CATEGORY_KEYS.map((catKey) => {
              const info = CATEGORIES[catKey];
              const isSelected = settings.selectedCategories.includes(catKey);
              return (
                <div key={catKey} className="relative w-full">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
                  <button
                    onClick={() => toggleCategory(catKey)}
                    className={`relative w-full flex items-center justify-between p-4 border-2 border-neutral-950 rounded text-left cursor-pointer transition-all ${
                      isSelected ? 'bg-neutral-100 ring-2 ring-violet-600' : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Color square / icon wrapper */}
                      <div
                        className="w-12 h-12 rounded border-2 border-neutral-950 flex items-center justify-center text-white shrink-0 shadow-[1.5px_1.5px_0_0_#000]"
                        style={{ backgroundColor: info.color }}
                      >
                        {(() => {
                          const CatIcon = categoryIcons[info.icon] || Sparkles;
                          return <CatIcon className="w-6 h-6" />;
                        })()}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-black text-base text-neutral-950 leading-none mb-1">
                          {info.label}
                        </span>
                        <span className="text-xs text-neutral-400">Termos Gerais · Níveis Variados</span>
                      </div>
                    </div>

                    {/* Styled checkbox */}
                    <div
                      className={`w-7 h-7 rounded border-2 border-neutral-950 flex items-center justify-center transition-all shadow-[1px_1px_0_0_#000] ${
                        isSelected ? 'text-white' : 'bg-[#FFFCF0]'
                      }`}
                      style={{ backgroundColor: isSelected ? info.color : '#FFFCF0' }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* General Mix Button */}
            <div className="relative w-full pt-4">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-neutral-950 rounded" />
              <button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, selectedCategories: CATEGORY_KEYS }))
                }
                className="relative w-full py-4 bg-white hover:bg-neutral-50 border-2 border-dashed border-neutral-950 rounded font-black text-sm text-neutral-950 text-center cursor-pointer transition-all"
              >
                ⇄ SELECIONAR TODAS AS CATEGORIAS
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom CTA Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t-4 border-neutral-950 bg-[#FFFCF0] flex justify-center z-10">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-neutral-950 rounded" />
          <button
            onClick={handleStart}
            className="relative w-full py-4 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-black text-lg tracking-widest border-4 border-neutral-950 rounded flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-sm"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>JOGAR AGORA!</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
