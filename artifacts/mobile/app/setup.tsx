import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useGame, GameSettings, Team, Player } from '@/context/GameContext';
import { CATEGORIES, CategoryKey } from '@/data/words';

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
const TEAM_COLORS = ['#6D28D9', '#D97706'];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 6);
}

/** Neubrutalist card wrapper with hard offset shadow */
function NeuCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.neuCardOuter, style]}>
      <View style={styles.neuCardShadow} />
      <View style={styles.neuCardInner}>{children}</View>
    </View>
  );
}

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [teams, setTeams] = useState<Team[]>([
    { id: 't1', name: 'Time 1', color: TEAM_COLORS[0], players: [], score: 0 },
    { id: 't2', name: 'Time 2', color: TEAM_COLORS[1], players: [], score: 0 },
  ]);

  const [newPlayerNames, setNewPlayerNames] = useState(['', '']);
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
  });

  function addPlayer(teamIdx: number) {
    const name = newPlayerNames[teamIdx].trim();
    if (!name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const player: Player = { id: generateId(), name };
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx ? { ...t, players: [...t.players, player] } : t
      )
    );
    setNewPlayerNames((prev) => prev.map((n, i) => (i === teamIdx ? '' : n)));
  }

  function removePlayer(teamIdx: number, playerId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTeams((prev) =>
      prev.map((t, i) =>
        i === teamIdx
          ? { ...t, players: t.players.filter((p) => p.id !== playerId) }
          : t
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
      Alert.alert('Ops!', 'Adicione pelo menos 1 jogador em cada time.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    startGame(teams, settings);
    router.push('/game');
  }

  const TABS: { key: typeof activeTab; label: string }[] = [
    { key: 'equipes', label: 'Equipes' },
    { key: 'regras', label: 'Regras' },
    { key: 'pacotes', label: 'Pacotes' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#FFFCF0' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backBtn}>← VOLTAR</Text>
        </Pressable>
        <Text style={styles.headerTitle}>CONFIGURAR JOGO</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? '#111' : '#6B5E4E' },
                activeTab === tab.key && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              {tab.label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 120, padding: 16, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── EQUIPES TAB ── */}
        {activeTab === 'equipes' &&
          teams.map((team, teamIdx) => (
            <NeuCard key={team.id}>
              {/* Team header strip */}
              <View style={[styles.teamStrip, { backgroundColor: team.color }]}>
                <Text style={styles.teamStripText}>{team.name.toUpperCase()}</Text>
                <Text style={styles.teamStripCount}>
                  {team.players.length} jogador{team.players.length !== 1 ? 'es' : ''}
                </Text>
              </View>

              {/* Player list */}
              {team.players.map((player) => (
                <View key={player.id} style={styles.playerRow}>
                  <Text style={styles.playerRowIcon}>●</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Pressable onPress={() => removePlayer(teamIdx, player.id)} hitSlop={12}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </Pressable>
                </View>
              ))}

              {/* Add player row */}
              <View style={styles.addRow}>
                <TextInput
                  style={styles.playerInput}
                  placeholder="Nome do jogador"
                  placeholderTextColor="#9B8E80"
                  value={newPlayerNames[teamIdx]}
                  onChangeText={(text) =>
                    setNewPlayerNames((prev) => prev.map((n, i) => (i === teamIdx ? text : n)))
                  }
                  onSubmitEditing={() => addPlayer(teamIdx)}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.addBtnWrapper]}
                  onPress={() => addPlayer(teamIdx)}
                >
                  <View style={[styles.addBtnShadow, { backgroundColor: '#111' }]} />
                  <View style={[styles.addBtn, { backgroundColor: team.color }]}>
                    <Text style={styles.addBtnText}>+</Text>
                  </View>
                </Pressable>
              </View>
            </NeuCard>
          ))}

        {/* ── REGRAS TAB ── */}
        {activeTab === 'regras' && (
          <>
            {/* Timer */}
            <NeuCard>
              <Text style={styles.ruleTitle}>⏱  TEMPO POR TURNO</Text>
              <View style={styles.optionRow}>
                {[30, 45, 60, 90].map((s) => {
                  const active = settings.timerSeconds === s;
                  return (
                    <Pressable
                      key={s}
                      style={[styles.optionBtnWrapper]}
                      onPress={() => setSettings((p) => ({ ...p, timerSeconds: s }))}
                    >
                      {active && <View style={styles.optionBtnShadow} />}
                      <View
                        style={[
                          styles.optionBtn,
                          active
                            ? { backgroundColor: '#6D28D9', borderColor: '#111' }
                            : { backgroundColor: '#FFFCF0', borderColor: '#111' },
                        ]}
                      >
                        <Text style={[styles.optionBtnText, { color: active ? '#fff' : '#111' }]}>
                          {s}s
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Tempo Decrescente</Text>
                  <Text style={styles.switchDesc}>O tempo reduz a cada rodada</Text>
                </View>
                <Switch
                  value={settings.timerMode === 'decreasing'}
                  onValueChange={(v) =>
                    setSettings((p) => ({ ...p, timerMode: v ? 'decreasing' : 'fixed' }))
                  }
                  trackColor={{ true: '#6D28D9', false: '#D1C5B8' }}
                />
              </View>
            </NeuCard>

            {/* Ordem */}
            <NeuCard>
              <Text style={styles.ruleTitle}>🔀  ORDEM DOS JOGADORES</Text>
              <View style={styles.optionRow}>
                {[
                  { key: 'sequential', label: '→  Sequencial' },
                  { key: 'random', label: '⇄  Aleatória' },
                ].map((opt) => {
                  const active = settings.playerOrder === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[styles.optionBtnWrapper, { flex: 1 }]}
                      onPress={() => setSettings((p) => ({ ...p, playerOrder: opt.key as any }))}
                    >
                      {active && <View style={styles.optionBtnShadow} />}
                      <View
                        style={[
                          styles.optionBtn,
                          { flex: 1, paddingVertical: 14 },
                          active
                            ? { backgroundColor: '#6D28D9', borderColor: '#111' }
                            : { backgroundColor: '#FFFCF0', borderColor: '#111' },
                        ]}
                      >
                        <Text style={[styles.optionBtnText, { color: active ? '#fff' : '#111' }]}>
                          {opt.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </NeuCard>

            {/* Pontuação */}
            <NeuCard>
              <Text style={styles.ruleTitle}>🏆  PONTOS PARA VENCER</Text>
              <View style={styles.optionRow}>
                {[10, 15, 20, 30].map((s) => {
                  const active = settings.targetScore === s;
                  return (
                    <Pressable
                      key={s}
                      style={styles.optionBtnWrapper}
                      onPress={() => setSettings((p) => ({ ...p, targetScore: s }))}
                    >
                      {active && <View style={[styles.optionBtnShadow, { backgroundColor: '#111' }]} />}
                      <View
                        style={[
                          styles.optionBtn,
                          active
                            ? { backgroundColor: '#D97706', borderColor: '#111' }
                            : { backgroundColor: '#FFFCF0', borderColor: '#111' },
                        ]}
                      >
                        <Text style={[styles.optionBtnText, { color: active ? '#fff' : '#111' }]}>
                          {s}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </NeuCard>

            {/* Modos especiais */}
            <NeuCard>
              <Text style={styles.ruleTitle}>✨  MODOS ESPECIAIS</Text>
              {[
                {
                  key: 'enableRoulette',
                  label: '🎲  Roleta de Categorias',
                  desc: 'Sorteia categoria e dificuldade a cada turno',
                  accent: '#6D28D9',
                },
                {
                  key: 'enableHotPotato',
                  label: '🔥  Batata Quente',
                  desc: 'Sorteia o mímico na hora, mantendo todos alertas',
                  accent: '#EA580C',
                },
                {
                  key: 'enableModifiers',
                  label: '🃏  Cartas Modificadoras',
                  desc: 'Regras especiais que mudam a dinâmica',
                  accent: '#DB2777',
                },
              ].map((opt, idx) => (
                <View
                  key={opt.key}
                  style={[
                    styles.switchRow,
                    idx > 0 && { borderTopWidth: 2, borderTopColor: '#111', paddingTop: 14 },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.switchLabel}>{opt.label}</Text>
                    <Text style={styles.switchDesc}>{opt.desc}</Text>
                  </View>
                  <Switch
                    value={settings[opt.key as keyof GameSettings] as boolean}
                    onValueChange={(v) => setSettings((p) => ({ ...p, [opt.key]: v }))}
                    trackColor={{ true: opt.accent, false: '#D1C5B8' }}
                  />
                </View>
              ))}
            </NeuCard>
          </>
        )}

        {/* ── PACOTES TAB ── */}
        {activeTab === 'pacotes' && (
          <>
            <Text style={styles.sectionDesc}>
              Escolha quais categorias entram no jogo. Mínimo de 1.
            </Text>
            {CATEGORY_KEYS.map((cat) => {
              const info = CATEGORIES[cat];
              const selected = settings.selectedCategories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={styles.catCardWrapper}
                  onPress={() => toggleCategory(cat)}
                >
                  <View style={styles.catCardShadow} />
                  <View
                    style={[
                      styles.catCard,
                      selected
                        ? { backgroundColor: info.color + '18', borderColor: '#111' }
                        : { backgroundColor: '#fff', borderColor: '#111' },
                    ]}
                  >
                    <View style={[styles.catIconBox, { backgroundColor: info.color, borderColor: '#111' }]}>
                      <Ionicons name={info.icon as any} size={22} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catLabel}>{info.label}</Text>
                      <Text style={styles.catDesc}>Fácil · Médio · Difícil</Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selected
                          ? { backgroundColor: info.color, borderColor: '#111' }
                          : { backgroundColor: '#FFFCF0', borderColor: '#111' },
                      ]}
                    >
                      {selected && <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' }}>✓</Text>}
                    </View>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              style={styles.mixBtnWrapper}
              onPress={() => setSettings((p) => ({ ...p, selectedCategories: CATEGORY_KEYS }))}
            >
              <View style={styles.mixBtnShadow} />
              <View style={styles.mixBtn}>
                <Text style={styles.mixLabel}>⇄  SELECIONAR TUDO (MIX GERAL)</Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <Pressable
          style={styles.startBtnWrapper}
          onPress={handleStart}
        >
          <View style={styles.startBtnShadow} />
          <View style={styles.startBtn}>
            <Text style={styles.startBtnText}>▶  JOGAR!</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#111',
    backgroundColor: '#FFFCF0',
  },
  backBtn: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    color: '#111',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    color: '#111',
  },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 3,
    borderBottomColor: '#111',
    backgroundColor: '#FFFCF0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0,
  },
  tabActive: {
    backgroundColor: '#111',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },

  scroll: { flex: 1 },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#6B5E4E',
    marginBottom: 4,
  },

  // NeuCard
  neuCardOuter: {
    position: 'relative',
    marginBottom: 4,
    marginRight: 4,
  },
  neuCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  neuCardInner: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#111',
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Teams
  teamStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#111',
  },
  teamStripText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 1,
  },
  teamStripCount: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffffCC',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E0D8',
  },
  playerRowIcon: {
    fontSize: 8,
    color: '#9B8E80',
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#111',
  },
  removeBtn: {
    fontSize: 16,
    color: '#9B8E80',
    fontFamily: 'Inter_700Bold',
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  playerInput: {
    flex: 1,
    height: 46,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#FFFCF0',
    color: '#111',
  },
  addBtnWrapper: {
    position: 'relative',
  },
  addBtnShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },

  // Rules
  ruleTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    color: '#111',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#111',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
    flexWrap: 'wrap',
  },
  optionBtnWrapper: {
    position: 'relative',
  },
  optionBtnShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  optionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#111',
  },
  switchDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B5E4E',
  },

  // Categories
  catCardWrapper: {
    position: 'relative',
    marginBottom: 4,
    marginRight: 4,
  },
  catCardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
  },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#111',
  },
  catDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B5E4E',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mixBtnWrapper: {
    position: 'relative',
    marginTop: 4,
    marginBottom: 4,
    marginRight: 4,
  },
  mixBtnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  mixBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    borderStyle: 'dashed',
    backgroundColor: '#FFFCF0',
  },
  mixLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#111',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 3,
    borderTopColor: '#111',
    backgroundColor: '#FFFCF0',
  },
  startBtnWrapper: {
    position: 'relative',
  },
  startBtnShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#111',
    backgroundColor: '#6D28D9',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
  },
});
