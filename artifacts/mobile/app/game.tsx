import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { CATEGORIES, DIFFICULTY_LABELS, DIFFICULTY_POINTS } from '@/data/words';
import { Timer } from '@/components/Timer';
import { RouletteSlot } from '@/components/RouletteSlot';

/** Neubrutalist proceed button */
function NeuProceedBtn({
  label,
  color = '#6D28D9',
  onPress,
}: {
  label: string;
  color?: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <View style={nb.proceedWrapper}>
      <View style={[nb.proceedShadow, { backgroundColor: '#111' }]} />
      <Pressable
        style={[nb.proceedBtn, { backgroundColor: color }, pressed && nb.btnPressed]}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
      >
        <Text style={nb.proceedBtnText}>{label}  →</Text>
      </Pressable>
    </View>
  );
}

// ─── Roulette Phase ────────────────────────────────────────────────────────────
function RoulettePhase() {
  const insets = useSafeAreaInsets();
  const { game, proceedFromRoulette } = useGame();
  const turn = game.currentTurn;
  const [spinDone, setSpinDone] = useState(false);

  if (!turn) return null;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <View style={styles.phaseHeader}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>RODADA {game.round}</Text>
        </View>
        <Text style={styles.phaseTitle}>Roleta de Categorias</Text>
      </View>

      <View style={styles.rouletteWrapper}>
        <RouletteSlot
          selectedCategory={turn.word.category}
          selectedDifficulty={turn.word.difficulty}
          onSpinComplete={() => setSpinDone(true)}
        />
      </View>

      {spinDone && (
        <NeuProceedBtn
          label="CONTINUAR"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            proceedFromRoulette();
          }}
        />
      )}
    </View>
  );
}

// ─── Hot Potato Phase ──────────────────────────────────────────────────────────
function HotPotatoPhase() {
  const insets = useSafeAreaInsets();
  const { game, proceedFromHotPotato } = useGame();
  const turn = game.currentTurn;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, []);

  if (!turn) return null;

  const team = game.teams[turn.teamIndex];
  const player = team?.players[turn.playerIndex];
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <View style={styles.phaseHeader}>
        <View style={[styles.badgePill, { backgroundColor: '#EA580C' }]}>
          <Text style={styles.badgePillText}>🔥 BATATA QUENTE!</Text>
        </View>
        <Text style={styles.phaseTitle}>Vez de...</Text>
      </View>

      <View style={styles.hotPotatoCenter}>
        <Text style={styles.flameEmoji}>🔥</Text>

        <Animated.View
          style={[
            styles.playerRevealWrapper,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.playerRevealShadow, { backgroundColor: team?.color ?? '#111' }]} />
          <View style={[styles.playerReveal, { backgroundColor: team?.color ?? '#6D28D9', borderColor: '#111' }]}>
            <Text style={styles.playerRevealName}>{player?.name ?? 'Jogador'}</Text>
            <Text style={styles.playerRevealTeam}>{team?.name}</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: opacityAnim }}>
        <NeuProceedBtn
          label="PRONTO!"
          color="#EA580C"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            proceedFromHotPotato();
          }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Modifier Phase ────────────────────────────────────────────────────────────
function ModifierPhase() {
  const insets = useSafeAreaInsets();
  const { game, proceedFromModifier } = useGame();
  const turn = game.currentTurn;
  const modifier = turn?.modifier;

  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 14 }).start();
    Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    });
  }, []);

  if (!modifier || !turn) return null;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <View style={styles.phaseHeader}>
        <View style={[styles.badgePill, { backgroundColor: '#DB2777' }]}>
          <Text style={styles.badgePillText}>🃏 CARTA ESPECIAL!</Text>
        </View>
        <Text style={styles.phaseTitle}>Regra Modificada</Text>
      </View>

      <Animated.View
        style={[
          styles.modifierCardWrapper,
          { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.modifierCardShadow, { backgroundColor: '#111' }]} />
        <View style={[styles.modifierCard, { borderColor: '#111', backgroundColor: '#DB277715' }]}>
          <View style={[styles.modifierIconBox, { backgroundColor: '#DB2777' }]}>
            <Ionicons name={modifier.icon as any} size={36} color="#fff" />
          </View>
          <Text style={[styles.modifierName, { color: '#111' }]}>{modifier.name}</Text>
          <Text style={[styles.modifierDesc, { color: '#6B5E4E' }]}>
            {modifier.description}
          </Text>
        </View>
      </Animated.View>

      <Text style={styles.modifierHint}>
        👁  Mostre para todos antes de começar!
      </Text>

      <NeuProceedBtn
        label="ENTENDIDO!"
        color="#DB2777"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          proceedFromModifier();
        }}
      />
    </View>
  );
}

// ─── Playing Phase ─────────────────────────────────────────────────────────────
function PlayingPhase() {
  const insets = useSafeAreaInsets();
  const { game, scorePoint, scoreError, skipWord } = useGame();
  const turn = game.currentTurn;

  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(turn?.timerSeconds ?? 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [errorPressed, setErrorPressed] = useState(false);
  const [pointPressed, setPointPressed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setTimeLeft(turn?.timerSeconds ?? 60);
    setTimerRunning(false);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [turn?.word.id]);

  const startTimer = useCallback(() => {
    if (timerRunning) return;
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerRunning]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    startTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [startTimer]);

  const handleTimeExpire = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => scoreError());
  }, [scoreError, flashAnim]);

  const handlePoint = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scorePoint();
  }, [scorePoint]);

  const handleError = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    scoreError();
  }, [scoreError]);

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerRunning(false);
    setRevealed(false);
    setTimeLeft(turn?.timerSeconds ?? 60);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skipWord();
  }, [skipWord, turn?.timerSeconds]);

  if (!turn) return null;

  const team = game.teams[turn.teamIndex];
  const player = team?.players[turn.playerIndex];
  const cat = CATEGORIES[turn.word.category];
  const diffColor =
    turn.word.difficulty === 'easy' ? '#16A34A' :
    turn.word.difficulty === 'medium' ? '#D97706' : '#DC2626';

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#DC262640'],
  });

  return (
    <Animated.View style={[styles.phaseContainer, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: flashBg }]} pointerEvents="none" />

      {/* Top scoreboard */}
      <View style={styles.scoreboard}>
        {game.teams.map((t, i) => {
          const isActive = i === turn.teamIndex;
          return (
            <View
              key={t.id}
              style={[
                styles.scoreChipWrapper,
                { flex: 1 },
              ]}
            >
              {isActive && <View style={[styles.scoreChipShadow, { backgroundColor: t.color }]} />}
              <View
                style={[
                  styles.scoreChip,
                  isActive
                    ? { backgroundColor: t.color, borderColor: '#111' }
                    : { backgroundColor: '#fff', borderColor: '#111' },
                ]}
              >
                <Text style={[styles.scoreChipName, { color: isActive ? '#fff' : '#6B5E4E' }]}>
                  {t.name}
                </Text>
                <Text style={[styles.scoreChipValue, { color: isActive ? '#fff' : '#111' }]}>
                  {t.score}
                </Text>
              </View>
            </View>
          );
        })}

        {revealed && (
          <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>⇄ TROCAR</Text>
          </Pressable>
        )}
      </View>

      {/* Player banner */}
      <View style={styles.playerBannerWrapper}>
        <View style={[styles.playerBannerShadow, { backgroundColor: team?.color ?? '#111' }]} />
        <View style={[styles.playerBanner, { backgroundColor: team?.color ?? '#6D28D9', borderColor: '#111' }]}>
          <Text style={styles.playerBannerText}>
            {player?.name}  ·  {team?.name}
          </Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Timer
          totalSeconds={turn.timerSeconds}
          remainingSeconds={timeLeft}
          running={timerRunning}
          onExpire={handleTimeExpire}
        />
      </View>

      {/* Word area */}
      <View style={styles.wordArea}>
        {!revealed ? (
          <Pressable onPress={handleReveal} style={styles.revealWrapper}>
            <View style={styles.revealShadow} />
            <View style={styles.revealCard}>
              <Text style={styles.revealEye}>👁</Text>
              <Text style={styles.revealTitle}>TOQUE PARA REVELAR</Text>
              <Text style={styles.revealHint}>Só o mímico vê!</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.wordCardWrapper}>
            <View style={styles.wordCardShadow} />
            <View style={styles.wordCard}>
              {/* Meta row */}
              <View style={styles.wordMeta}>
                <View style={[styles.catBadge, { backgroundColor: cat.color, borderColor: '#111' }]}>
                  <Ionicons name={cat.icon as any} size={12} color="#fff" />
                  <Text style={styles.catBadgeText}>{cat.label.toUpperCase()}</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: diffColor, borderColor: '#111' }]}>
                  <Text style={styles.diffBadgeText}>
                    {DIFFICULTY_LABELS[turn.word.difficulty].toUpperCase()}  +{DIFFICULTY_POINTS[turn.word.difficulty]}pt
                  </Text>
                </View>
              </View>

              {/* The word */}
              <Text style={styles.wordText}>{turn.word.term}</Text>

              {/* Modifier reminder */}
              {turn.modifier && (
                <View style={[styles.modBanner, { backgroundColor: '#DB277715', borderColor: '#DB2777' }]}>
                  <Ionicons name={turn.modifier.icon as any} size={14} color="#DB2777" />
                  <Text style={[styles.modBannerText, { color: '#DB2777' }]}>
                    {turn.modifier.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {revealed && (
        <View style={styles.actionRow}>
          {/* ERRO */}
          <View style={[styles.actionBtnWrapper, { flex: 1 }]}>
            <View style={[styles.actionBtnShadow, { backgroundColor: '#111' }]} />
            <Pressable
              style={[styles.errorBtn, errorPressed && styles.btnPressed]}
              onPressIn={() => setErrorPressed(true)}
              onPressOut={() => setErrorPressed(false)}
              onPress={handleError}
            >
              <Text style={styles.actionBtnIcon}>✕</Text>
              <Text style={styles.actionBtnText}>ERRO</Text>
            </Pressable>
          </View>

          {/* PONTO */}
          <View style={[styles.actionBtnWrapper, { flex: 1 }]}>
            <View style={[styles.actionBtnShadow, { backgroundColor: '#111' }]} />
            <Pressable
              style={[styles.pointBtn, pointPressed && styles.btnPressed]}
              onPressIn={() => setPointPressed(true)}
              onPressOut={() => setPointPressed(false)}
              onPress={handlePoint}
            >
              <Text style={styles.actionBtnIcon}>✓</Text>
              <Text style={styles.actionBtnText}>PONTO!</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Turn End Phase ────────────────────────────────────────────────────────────
function TurnEndPhase() {
  const insets = useSafeAreaInsets();
  const { game, nextTurn } = useGame();
  const turn = game.currentTurn;
  const isPoint = turn?.result === 'point';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 10 }).start();
  }, []);

  if (!turn) return null;

  const team = game.teams[turn.teamIndex];
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const color = isPoint ? '#16A34A' : '#DC2626';

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <Animated.View style={[styles.turnEndCenter, { transform: [{ scale: scaleAnim }] }]}>
        {/* Big result badge */}
        <View style={styles.resultBadgeWrapper}>
          <View style={[styles.resultBadgeShadow, { backgroundColor: '#111' }]} />
          <View style={[styles.resultBadge, { backgroundColor: color, borderColor: '#111' }]}>
            <Text style={styles.resultBadgeIcon}>{isPoint ? '✓' : '✕'}</Text>
            <Text style={styles.resultBadgeLabel}>{isPoint ? 'PONTO!' : 'ERRO!'}</Text>
          </View>
        </View>

        <Text style={styles.turnEndWord}>{turn.word.term}</Text>

        {isPoint && (
          <Text style={styles.turnEndPoints}>
            +{turn.pointValue} ponto{turn.pointValue > 1 ? 's' : ''} para {team?.name}
          </Text>
        )}

        {/* Score summary */}
        <View style={styles.scoreSummary}>
          {game.teams.map((t) => (
            <View key={t.id} style={styles.scoreSummaryItemWrapper}>
              <View style={[styles.scoreSummaryShadow, { backgroundColor: t.color }]} />
              <View style={[styles.scoreSummaryItem, { borderColor: '#111', backgroundColor: '#fff' }]}>
                <Text style={[styles.scoreSummaryName, { color: t.color }]}>{t.name}</Text>
                <Text style={styles.scoreSummaryValue}>{t.score}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      <NeuProceedBtn
        label="PRÓXIMO TURNO"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          nextTurn();
        }}
      />
    </View>
  );
}

// ─── Round End Phase ───────────────────────────────────────────────────────────
function RoundEndPhase() {
  const insets = useSafeAreaInsets();
  const { game, nextRound } = useGame();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const recentTurns = [...game.turnHistory].reverse().slice(0, 6);

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <View style={styles.phaseHeader}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>RODADA {game.round} ENCERRADA</Text>
        </View>
        <Text style={styles.phaseTitle}>Placar</Text>
      </View>

      {/* Team score cards */}
      <View style={styles.teamScoreCards}>
        {game.teams.map((t) => {
          const leading = game.teams.every((ot) => ot.id === t.id || t.score >= ot.score);
          return (
            <View key={t.id} style={[styles.bigScoreWrapper, { flex: 1 }]}>
              <View style={[styles.bigScoreShadow, { backgroundColor: t.color }]} />
              <View style={[styles.bigScoreCard, { borderColor: '#111', backgroundColor: leading ? t.color + '18' : '#fff' }]}>
                {leading && <Text style={styles.leadEmoji}>🏆</Text>}
                <Text style={[styles.bigScoreName, { color: t.color }]}>{t.name}</Text>
                <Text style={styles.bigScoreValue}>{t.score}</Text>
                <Text style={styles.bigScoreTarget}>/ {game.settings.targetScore} pts</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Turn history */}
      {recentTurns.length > 0 && (
        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {recentTurns.map((r, i) => {
            const t = game.teams[r.teamIndex];
            return (
              <View key={i} style={[styles.historyRow, { borderBottomColor: '#E8E0D8' }]}>
                <View style={[styles.historyDot, { backgroundColor: t?.color ?? '#6D28D9' }]} />
                <Text style={styles.historyPlayer}>{r.playerName}</Text>
                <Text style={styles.historyWord}>{r.wordTerm}</Text>
                <View
                  style={[
                    styles.historyResult,
                    { backgroundColor: r.result === 'point' ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  <Text style={styles.historyResultText}>
                    {r.result === 'point' ? `+${r.points}` : '✕'}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <NeuProceedBtn
        label="PRÓXIMA RODADA"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          nextRound();
        }}
      />
    </View>
  );
}

// ─── Game End Phase ────────────────────────────────────────────────────────────
function GameEndPhase() {
  const insets = useSafeAreaInsets();
  const { game, resetGame } = useGame();

  const winner = game.teams.reduce((a, b) => (a.score >= b.score ? a : b));
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 8 }).start();
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.phaseContainer, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>
      <Animated.View style={[styles.gameEndCenter, { transform: [{ scale: scaleAnim }] }]}>
        {/* Trophy card */}
        <View style={styles.trophyWrapper}>
          <View style={[styles.trophyShadow, { backgroundColor: winner.color }]} />
          <View style={[styles.trophyCard, { backgroundColor: winner.color, borderColor: '#111' }]}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.gameEndWinnerLabel}>VENCEDOR</Text>
            <Text style={styles.gameEndWinnerName}>{winner.name}</Text>
            <Text style={styles.gameEndScore}>{winner.score} pontos</Text>
          </View>
        </View>
      </Animated.View>

      {/* Final scores */}
      <View style={styles.teamScoreCards}>
        {game.teams.map((t) => (
          <View key={t.id} style={[styles.bigScoreWrapper, { flex: 1 }]}>
            <View style={[styles.bigScoreShadow, { backgroundColor: t.color }]} />
            <View style={[styles.bigScoreCard, { borderColor: '#111', backgroundColor: '#fff' }]}>
              <Text style={[styles.bigScoreName, { color: t.color }]}>{t.name}</Text>
              <Text style={styles.bigScoreValue}>{t.score}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* End buttons */}
      <View style={{ gap: 12 }}>
        <NeuProceedBtn
          label="↺  JOGAR NOVAMENTE"
          onPress={() => {
            resetGame();
            router.replace('/setup');
          }}
        />
        <Pressable
          style={styles.homeBtn}
          onPress={() => {
            resetGame();
            router.replace('/');
          }}
        >
          <Text style={styles.homeBtnText}>← INÍCIO</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Root Game Screen ──────────────────────────────────────────────────────────
export default function GameScreen() {
  const { game } = useGame();

  if (game.phase === 'roulette') return <RoulettePhase />;
  if (game.phase === 'hot-potato') return <HotPotatoPhase />;
  if (game.phase === 'modifier-reveal') return <ModifierPhase />;
  if (game.phase === 'playing') return <PlayingPhase />;
  if (game.phase === 'turn-end') return <TurnEndPhase />;
  if (game.phase === 'round-end') return <RoundEndPhase />;
  if (game.phase === 'game-end') return <GameEndPhase />;

  return null;
}

// ─── NeuButton shared styles (used by NeuProceedBtn) ──────────────────────────
const nb = StyleSheet.create({
  proceedWrapper: {
    position: 'relative',
  },
  proceedShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 4,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  btnPressed: {
    transform: [{ translateX: 5 }, { translateY: 5 }],
  },
});

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  phaseContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
    backgroundColor: '#FFFCF0',
  },
  btnPressed: {
    transform: [{ translateX: 5 }, { translateY: 5 }],
  },

  // Phase header
  phaseHeader: { gap: 8 },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#111',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    color: '#fff',
  },
  phaseTitle: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: '#111',
  },
  rouletteWrapper: { flex: 1, justifyContent: 'center' },

  // Hot potato
  hotPotatoCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  flameEmoji: { fontSize: 80 },
  playerRevealWrapper: {
    position: 'relative',
    alignSelf: 'stretch',
  },
  playerRevealShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 4,
  },
  playerReveal: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 4,
    borderWidth: 3,
    gap: 8,
  },
  playerRevealName: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  playerRevealTeam: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffffCC',
    letterSpacing: 1,
  },

  // Modifier
  modifierCardWrapper: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
  },
  modifierCardShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 4,
  },
  modifierCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 4,
    borderWidth: 3,
    gap: 16,
  },
  modifierIconBox: {
    width: 72,
    height: 72,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modifierName: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  modifierDesc: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  modifierHint: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B5E4E',
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Playing — scoreboard
  scoreboard: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  scoreChipWrapper: { position: 'relative' },
  scoreChipShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    gap: 6,
  },
  scoreChipName: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  scoreChipValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#111',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  skipBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    letterSpacing: 1,
  },

  // Player banner
  playerBannerWrapper: { position: 'relative' },
  playerBannerShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
  },
  playerBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
  },
  playerBannerText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 1,
  },

  // Timer
  timerSection: { paddingHorizontal: 4 },

  // Word area
  wordArea: { flex: 1, justifyContent: 'center' },

  revealWrapper: { position: 'relative' },
  revealShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  revealCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    backgroundColor: '#fff',
    gap: 12,
    borderStyle: 'dashed',
  },
  revealEye: { fontSize: 56 },
  revealTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    letterSpacing: 2,
    textAlign: 'center',
  },
  revealHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B5E4E',
  },

  wordCardWrapper: { position: 'relative' },
  wordCardShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  wordCard: {
    padding: 24,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    backgroundColor: '#fff',
    gap: 16,
    alignItems: 'center',
  },
  wordMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
  },
  catBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
  },
  diffBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  wordText: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    textAlign: 'center',
    lineHeight: 56,
  },
  modBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  modBannerText: { fontSize: 13, fontFamily: 'Inter_700Bold' },

  // Action buttons
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtnWrapper: { position: 'relative' },
  actionBtnShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 4,
  },
  errorBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    backgroundColor: '#DC2626',
    gap: 4,
  },
  pointBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    backgroundColor: '#16A34A',
    gap: 4,
  },
  actionBtnIcon: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },

  // Turn end
  turnEndCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  resultBadgeWrapper: { position: 'relative', alignSelf: 'stretch', marginHorizontal: 20 },
  resultBadgeShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 4,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 4,
    borderWidth: 3,
  },
  resultBadgeIcon: { fontSize: 32, color: '#fff', fontFamily: 'Inter_700Bold' },
  resultBadgeLabel: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 3,
  },
  turnEndWord: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    textAlign: 'center',
  },
  turnEndPoints: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B5E4E',
    textAlign: 'center',
  },
  scoreSummary: { flexDirection: 'row', gap: 12 },
  scoreSummaryItemWrapper: { position: 'relative', flex: 1 },
  scoreSummaryShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
  },
  scoreSummaryItem: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 4,
    borderWidth: 2,
    gap: 4,
  },
  scoreSummaryName: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  scoreSummaryValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#111' },

  // Round end
  teamScoreCards: { flexDirection: 'row', gap: 12 },
  bigScoreWrapper: { position: 'relative' },
  bigScoreShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 4,
  },
  bigScoreCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    borderWidth: 3,
    gap: 4,
  },
  leadEmoji: { fontSize: 20 },
  bigScoreName: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  bigScoreValue: { fontSize: 44, fontFamily: 'Inter_700Bold', color: '#111' },
  bigScoreTarget: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B5E4E' },

  historyList: { flex: 1 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  historyDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#111' },
  historyPlayer: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#111' },
  historyWord: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#6B5E4E' },
  historyResult: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
  },
  historyResultText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#fff' },

  // Game end
  gameEndCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trophyWrapper: { position: 'relative', alignSelf: 'stretch', marginHorizontal: 20 },
  trophyShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 4,
  },
  trophyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 4,
    borderWidth: 3,
    gap: 10,
  },
  trophyEmoji: { fontSize: 64 },
  gameEndWinnerLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
    color: '#ffffffCC',
  },
  gameEndWinnerName: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  gameEndScore: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffffCC',
  },
  homeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#FFFCF0',
  },
  homeBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    letterSpacing: 2,
  },
});
