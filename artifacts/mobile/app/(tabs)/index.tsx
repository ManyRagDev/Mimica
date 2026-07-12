import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { game, resetGame } = useGame();

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const [primaryPressed, setPrimaryPressed] = React.useState(false);
  const [secondaryPressed, setSecondaryPressed] = React.useState(false);

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(titleAnim, { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.spring(subtitleAnim, { toValue: 1, useNativeDriver: true, damping: 14 }),
      Animated.spring(btnAnim, { toValue: 1, useNativeDriver: true, damping: 14 }),
    ]).start();
  }, []);

  const hasGame = game.phase !== 'idle' && game.teams.length > 0;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const features = [
    { label: '🎲  Roleta de Categorias', color: colors.primary },
    { label: '🔥  Batata Quente', color: '#EA580C' },
    { label: '🃏  Cartas Especiais', color: '#DB2777' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dot grid background */}
      <View style={[StyleSheet.absoluteFill, styles.dotsContainer]} pointerEvents="none">
        {Array.from({ length: 120 }).map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>

      <View style={[styles.inner, { paddingTop: topPad + 40, paddingBottom: bottomPad + 24 }]}>

        {/* Eyebrow */}
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}
        >
          <View style={styles.eyebrow}>
            <View style={[styles.eyebrowDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.eyebrowDot, { backgroundColor: colors.accent }]} />
            <View style={[styles.eyebrowDot, { backgroundColor: colors.destructive }]} />
            <Text style={styles.eyebrowText}>JOGO DE FESTA</Text>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <View style={[styles.titleAccentBar, { backgroundColor: colors.accent }]} />
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>MÍMICA</Text>
              <Text style={[styles.titlePurple, { color: colors.primary }]}>PARTY</Text>
            </View>
          </View>
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, opacity: subtitleAnim },
          ]}
        >
          O jogo de mímica que não para de te surpreender
        </Animated.Text>

        {/* Feature chips */}
        <Animated.View style={[styles.chips, { opacity: subtitleAnim }]}>
          {features.map((f, i) => (
            <View
              key={i}
              style={[
                styles.chipWrapper,
              ]}
            >
              {/* Hard shadow */}
              <View style={[styles.chipShadow, { backgroundColor: colors.shadow }]} />
              <View
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{f.label}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Buttons */}
        <Animated.View
          style={[
            styles.btnGroup,
            {
              opacity: btnAnim,
              transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          {/* Primary button */}
          <View style={styles.btnWrapper}>
            <View style={[styles.btnShadow, { backgroundColor: colors.shadow }]} />
            <Pressable
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary, borderColor: colors.border },
                primaryPressed && styles.btnPressed,
              ]}
              onPressIn={() => setPrimaryPressed(true)}
              onPressOut={() => setPrimaryPressed(false)}
              onPress={() => {
                resetGame();
                router.push('/setup');
              }}
            >
              <Text style={styles.primaryBtnText}>＋  NOVO JOGO</Text>
            </Pressable>
          </View>

          {hasGame && (
            <View style={styles.btnWrapper}>
              <View style={[styles.btnShadow, { backgroundColor: colors.shadow }]} />
              <Pressable
                style={[
                  styles.secondaryBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  secondaryPressed && styles.btnPressed,
                ]}
                onPressIn={() => setSecondaryPressed(true)}
                onPressOut={() => setSecondaryPressed(false)}
                onPress={() => router.push('/game')}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
                  ▶  CONTINUAR JOGO
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Para 4+ pessoas · Ideal para festas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 24,
    opacity: 0.15,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  eyebrowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#111',
  },
  eyebrowText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
    color: '#6B5E4E',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleAccentBar: {
    width: 10,
    height: 112,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#111',
    marginTop: 4,
  },
  title: {
    fontSize: 60,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
    lineHeight: 60,
  },
  titlePurple: {
    fontSize: 60,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -2,
    lineHeight: 60,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginTop: 20,
    lineHeight: 22,
  },
  chips: {
    marginTop: 20,
    gap: 10,
  },
  chipWrapper: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  chipShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 2,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  spacer: { flex: 1 },
  btnGroup: { gap: 12, marginBottom: 20 },
  btnWrapper: {
    position: 'relative',
  },
  btnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 4,
    borderWidth: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 4,
    borderWidth: 3,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  btnPressed: {
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
});
