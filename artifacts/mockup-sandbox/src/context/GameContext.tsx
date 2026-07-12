import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { CategoryKey, Difficulty, getRandomModifier, getRandomWord, DIFFICULTY_POINTS, Modifier, Word } from '../data/words';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  score: number;
}

export interface GameSettings {
  timerSeconds: number;
  timerMode: 'fixed' | 'decreasing';
  playerOrder: 'sequential' | 'random';
  selectedCategories: CategoryKey[];
  enableRoulette: boolean;
  enableHotPotato: boolean;
  enableModifiers: boolean;
  enableSabotage: boolean;
  targetScore: number;
  difficulty: 'all' | Difficulty;
}

export type GamePhase =
  | 'idle'
  | 'roulette'
  | 'hot-potato'
  | 'modifier-reveal'
  | 'playing'
  | 'turn-end'
  | 'round-end'
  | 'game-end';

export interface TurnState {
  teamIndex: number;
  playerIndex: number;
  word: Word;
  modifier: Modifier | null;
  pointValue: number;
  timerSeconds: number;
  result?: 'point' | 'error';
}

export interface TurnRecord {
  teamIndex: number;
  playerName: string;
  wordTerm: string;
  result: 'point' | 'error';
  points: number;
}

export interface GameState {
  phase: GamePhase;
  teams: Team[];
  settings: GameSettings;
  currentTurn: TurnState | null;
  round: number;
  turnsThisRound: number;
  totalTurnsPerRound: number;
  usedWordIds: string[];
  turnHistory: TurnRecord[];
  lastRoundScore: { teamIndex: number; points: number }[];
}

type GameAction =
  | { type: 'START_GAME'; teams: Team[]; settings: GameSettings }
  | { type: 'BEGIN_TURN' }
  | { type: 'PROCEED_TO_MODIFIER' }
  | { type: 'PROCEED_TO_PLAYING' }
  | { type: 'SKIP_WORD' }
  | { type: 'SCORE_POINT' }
  | { type: 'SCORE_ERROR' }
  | { type: 'NEXT_TURN' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };

const DEFAULT_SETTINGS: GameSettings = {
  timerSeconds: 60,
  timerMode: 'fixed',
  playerOrder: 'sequential',
  selectedCategories: ['acoes', 'cultura-pop', 'lugares', 'objetos', 'abstratos'],
  enableRoulette: true,
  enableHotPotato: false,
  enableModifiers: false,
  enableSabotage: false,
  targetScore: 15,
  difficulty: 'all',
};

const initialState: GameState = {
  phase: 'idle',
  teams: [],
  settings: DEFAULT_SETTINGS,
  currentTurn: null,
  round: 0,
  turnsThisRound: 0,
  totalTurnsPerRound: 0,
  usedWordIds: [],
  turnHistory: [],
  lastRoundScore: [],
};

function pickNextPlayer(
  state: GameState,
  teamIndex: number
): number {
  const team = state.teams[teamIndex];
  if (!team || team.players.length === 0) return 0;
  if (state.settings.playerOrder === 'random') {
    return Math.floor(Math.random() * team.players.length);
  }
  // Sequential: find next player based on turn count
  const turnsForThisTeam = state.turnHistory.filter((t) => t.teamIndex === teamIndex).length;
  return turnsForThisTeam % team.players.length;
}

function buildTurn(
  state: GameState,
  teamIndex: number,
  playerIndex: number
): TurnState | null {
  const chosenDiff = state.settings.difficulty === 'all' ? undefined : state.settings.difficulty;
  const word = getRandomWord(
    state.settings.selectedCategories,
    state.usedWordIds,
    chosenDiff
  );
  if (!word) {
    // Fallback: ignore used IDs
    const fallback = getRandomWord(state.settings.selectedCategories, [], chosenDiff);
    if (!fallback) return null;
    return buildTurnFromWord(state, teamIndex, playerIndex, fallback);
  }
  return buildTurnFromWord(state, teamIndex, playerIndex, word);
}

function buildTurnFromWord(
  state: GameState,
  teamIndex: number,
  playerIndex: number,
  word: Word
): TurnState {
  const modifier =
    state.settings.enableModifiers && Math.random() < 0.3
      ? getRandomModifier()
      : null;

  const baseTime = state.settings.timerSeconds;
  const timerSeconds =
    state.settings.timerMode === 'decreasing'
      ? Math.max(20, baseTime - state.round * 5)
      : baseTime;

  const isTurboModifier = modifier?.id === 'm4';
  const finalTimer = isTurboModifier ? Math.ceil(timerSeconds / 2) : timerSeconds;

  return {
    teamIndex,
    playerIndex,
    word,
    modifier,
    pointValue: DIFFICULTY_POINTS[word.difficulty],
    timerSeconds: finalTimer,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const totalTurnsPerRound =
        action.teams[0].players.length + action.teams[1].players.length;
      
      const baseState: GameState = {
        ...initialState,
        teams: action.teams,
        settings: action.settings,
        round: 1,
        turnsThisRound: 0,
        totalTurnsPerRound,
        usedWordIds: [],
        turnHistory: [],
        lastRoundScore: [],
      };

      const teamIndex = 0;
      const playerIndex = pickNextPlayer(baseState, teamIndex);
      const turn = buildTurn(baseState, teamIndex, playerIndex);

      const nextPhase = action.settings.enableRoulette
        ? 'roulette'
        : action.settings.enableHotPotato
        ? 'hot-potato'
        : action.settings.enableModifiers && turn?.modifier
        ? 'modifier-reveal'
        : 'playing';

      return {
        ...baseState,
        phase: nextPhase,
        currentTurn: turn,
      };
    }

    case 'BEGIN_TURN': {
      // Alternate teams: even turns = team 0, odd turns = team 1
      const teamIndex = state.turnsThisRound % 2;
      const playerIndex = pickNextPlayer(state, teamIndex);
      const turn = buildTurn(state, teamIndex, playerIndex);
      if (!turn) return state;

      if (state.settings.enableRoulette) {
        return { ...state, phase: 'roulette', currentTurn: turn };
      }
      if (state.settings.enableHotPotato) {
        return { ...state, phase: 'hot-potato', currentTurn: turn };
      }
      if (state.settings.enableModifiers && turn.modifier) {
        return { ...state, phase: 'modifier-reveal', currentTurn: turn };
      }
      return { ...state, phase: 'playing', currentTurn: turn };
    }

    case 'PROCEED_TO_MODIFIER': {
      if (state.settings.enableHotPotato && state.phase === 'roulette') {
        return { ...state, phase: 'hot-potato' };
      }
      if (state.currentTurn?.modifier) {
        return { ...state, phase: 'modifier-reveal' };
      }
      return { ...state, phase: 'playing' };
    }

    case 'PROCEED_TO_PLAYING': {
      return { ...state, phase: 'playing' };
    }

    case 'SKIP_WORD': {
      if (!state.currentTurn) return state;
      const { teamIndex, playerIndex, word } = state.currentTurn;
      const chosenDiff = state.settings.difficulty === 'all' ? undefined : state.settings.difficulty;
      // Get new word in the same category
      const newWord = getRandomWord(
        [word.category],
        [...state.usedWordIds, word.id],
        chosenDiff
      ) ?? getRandomWord(
        state.settings.selectedCategories,
        [...state.usedWordIds, word.id],
        chosenDiff
      );
      if (!newWord) return state;
      const newTurn = buildTurnFromWord(state, teamIndex, playerIndex, newWord);
      return {
        ...state,
        usedWordIds: [...state.usedWordIds, word.id],
        currentTurn: newTurn,
      };
    }

    case 'SCORE_POINT': {
      if (!state.currentTurn) return state;
      const { teamIndex, playerIndex, word, pointValue } = state.currentTurn;
      const team = state.teams[teamIndex];
      const playerName = team?.players[playerIndex]?.name ?? 'Jogador';
      const newTeams = state.teams.map((t, i) =>
        i === teamIndex ? { ...t, score: t.score + pointValue } : t
      );
      const record: TurnRecord = {
        teamIndex,
        playerName,
        wordTerm: word.term,
        result: 'point',
        points: pointValue,
      };
      const updatedTurn = { ...state.currentTurn, result: 'point' as const };
      return {
        ...state,
        teams: newTeams,
        currentTurn: updatedTurn,
        phase: 'turn-end',
        usedWordIds: [...state.usedWordIds, word.id],
        turnHistory: [...state.turnHistory, record],
      };
    }

    case 'SCORE_ERROR': {
      if (!state.currentTurn) return state;
      const { teamIndex, playerIndex, word } = state.currentTurn;
      const team = state.teams[teamIndex];
      const playerName = team?.players[playerIndex]?.name ?? 'Jogador';
      const record: TurnRecord = {
        teamIndex,
        playerName,
        wordTerm: word.term,
        result: 'error',
        points: 0,
      };
      const updatedTurn = { ...state.currentTurn, result: 'error' as const };
      return {
        ...state,
        currentTurn: updatedTurn,
        phase: 'turn-end',
        usedWordIds: [...state.usedWordIds, word.id],
        turnHistory: [...state.turnHistory, record],
      };
    }

    case 'NEXT_TURN': {
      const newTurnsThisRound = state.turnsThisRound + 1;
      // Check win condition
      const winner = state.teams.find((t) => t.score >= state.settings.targetScore);
      if (winner) {
        return { ...state, turnsThisRound: newTurnsThisRound, phase: 'game-end' };
      }
      // Check round end
      if (newTurnsThisRound >= state.totalTurnsPerRound) {
        return {
          ...state,
          turnsThisRound: newTurnsThisRound,
          phase: 'round-end',
        };
      }
      // Next turn
      const teamIndex = newTurnsThisRound % 2;
      const playerIndex = pickNextPlayer(
        { ...state, turnsThisRound: newTurnsThisRound },
        teamIndex
      );
      const turn = buildTurn({ ...state, turnsThisRound: newTurnsThisRound }, teamIndex, playerIndex);
      if (!turn) return { ...state, turnsThisRound: newTurnsThisRound, phase: 'round-end' };

      if (state.settings.enableRoulette) {
        return { ...state, turnsThisRound: newTurnsThisRound, phase: 'roulette', currentTurn: turn };
      }
      if (state.settings.enableHotPotato) {
        return { ...state, turnsThisRound: newTurnsThisRound, phase: 'hot-potato', currentTurn: turn };
      }
      if (state.settings.enableModifiers && turn.modifier) {
        return { ...state, turnsThisRound: newTurnsThisRound, phase: 'modifier-reveal', currentTurn: turn };
      }
      return { ...state, turnsThisRound: newTurnsThisRound, phase: 'playing', currentTurn: turn };
    }

    case 'NEXT_ROUND': {
      const winner = state.teams.find((t) => t.score >= state.settings.targetScore);
      if (winner) return { ...state, phase: 'game-end' };

      const newRound = state.round + 1;
      const teamIndex = 0;
      const playerIndex = pickNextPlayer({ ...state, turnsThisRound: 0 }, teamIndex);
      const turn = buildTurn({ ...state, turnsThisRound: 0 }, teamIndex, playerIndex);
      if (!turn) return { ...state, round: newRound, phase: 'game-end' };

      const nextPhase = state.settings.enableRoulette
        ? 'roulette'
        : state.settings.enableHotPotato
        ? 'hot-potato'
        : state.settings.enableModifiers && turn.modifier
        ? 'modifier-reveal'
        : 'playing';

      return {
        ...state,
        round: newRound,
        turnsThisRound: 0,
        currentTurn: turn,
        phase: nextPhase,
      };
    }

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

interface GameContextType {
  game: GameState;
  startGame: (teams: Team[], settings: GameSettings) => void;
  beginTurn: () => void;
  proceedFromRoulette: () => void;
  proceedFromHotPotato: () => void;
  proceedFromModifier: () => void;
  skipWord: () => void;
  scorePoint: () => void;
  scoreError: () => void;
  nextTurn: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((teams: Team[], settings: GameSettings) => {
    dispatch({ type: 'START_GAME', teams, settings });
  }, []);

  const beginTurn = useCallback(() => {
    dispatch({ type: 'BEGIN_TURN' });
  }, []);

  const proceedFromRoulette = useCallback(() => {
    if (game.settings.enableHotPotato) {
      dispatch({ type: 'PROCEED_TO_MODIFIER' }); // proceeds to hot-potato
    } else if (game.currentTurn?.modifier) {
      dispatch({ type: 'PROCEED_TO_MODIFIER' }); // proceeds to modifier-reveal
    } else {
      dispatch({ type: 'PROCEED_TO_PLAYING' });
    }
  }, [game.settings.enableHotPotato, game.currentTurn?.modifier]);

  const proceedFromHotPotato = useCallback(() => {
    if (game.currentTurn?.modifier) {
      dispatch({ type: 'PROCEED_TO_PLAYING' }); // proceeds to modifier-reveal/playing depending on reducer
    } else {
      dispatch({ type: 'PROCEED_TO_PLAYING' });
    }
  }, [game.currentTurn?.modifier]);

  const proceedFromModifier = useCallback(() => {
    dispatch({ type: 'PROCEED_TO_PLAYING' });
  }, []);

  const skipWord = useCallback(() => dispatch({ type: 'SKIP_WORD' }), []);
  const scorePoint = useCallback(() => dispatch({ type: 'SCORE_POINT' }), []);
  const scoreError = useCallback(() => dispatch({ type: 'SCORE_ERROR' }), []);
  const nextTurn = useCallback(() => dispatch({ type: 'NEXT_TURN' }), []);
  const nextRound = useCallback(() => dispatch({ type: 'NEXT_ROUND' }), []);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);

  return (
    <GameContext.Provider
      value={{
        game,
        startGame,
        beginTurn,
        proceedFromRoulette,
        proceedFromHotPotato,
        proceedFromModifier,
        skipWord,
        scorePoint,
        scoreError,
        nextTurn,
        nextRound,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
