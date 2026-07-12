import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { CATEGORIES, CategoryKey, Difficulty, DIFFICULTY_LABELS } from '@/data/words';

interface RouletteSlotProps {
  selectedCategory: CategoryKey;
  selectedDifficulty: Difficulty;
  onSpinComplete: () => void;
}

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 5;
const LOOPS = 4;

export function RouletteSlot({ selectedCategory, selectedDifficulty, onSpinComplete }: RouletteSlotProps) {
  const colors = useColors();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const onSpinCompleteRef = useRef(onSpinComplete);
  onSpinCompleteRef.current = onSpinComplete;

  const targetIndex = CATEGORY_KEYS.indexOf(selectedCategory);
  const extendedItems = [
    ...Array(LOOPS).fill(CATEGORY_KEYS).flat(),
    ...CATEGORY_KEYS,
  ];

  const finalIndex = LOOPS * CATEGORY_KEYS.length + targetIndex;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSpinning(true);
      Animated.timing(scrollY, {
        toValue: finalIndex * ITEM_HEIGHT,
        duration: 2800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setDone(true);
          setTimeout(() => onSpinCompleteRef.current(), 600);
        }
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const cat = CATEGORIES[selectedCategory];
  const diffColor = selectedDifficulty === 'easy' ? '#16A34A' : selectedDifficulty === 'medium' ? '#F59E0B' : '#DC2626';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>
        SORTEANDO CATEGORIA...
      </Text>

      {/* Slot machine window */}
      <View style={styles.windowWrapper}>
        {/* Hard shadow */}
        <View style={styles.windowShadow} />
        <View style={[styles.window, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {/* Center highlight */}
          <View style={[styles.centerHighlight, { borderColor: colors.primary }]} />

          <View style={[styles.mask, { height: VISIBLE_ITEMS * ITEM_HEIGHT }]}>
            <Animated.View
              style={{
                transform: [{ translateY: Animated.multiply(scrollY, -1) }],
              }}
            >
              {extendedItems.map((key, i) => {
                const c = CATEGORIES[key as CategoryKey];
                return (
                  <View
                    key={i}
                    style={[styles.slotItem, { height: ITEM_HEIGHT }]}
                  >
                    <View style={[styles.catDot, { backgroundColor: c.color, borderColor: '#111' }]} />
                    <Text style={[styles.slotText, { color: colors.foreground }]}>
                      {c.label}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>
          </View>

          {/* Fade overlays */}
          <View style={[styles.fadeTop, { backgroundColor: colors.card }]} pointerEvents="none" />
          <View style={[styles.fadeBottom, { backgroundColor: colors.card }]} pointerEvents="none" />
        </View>
      </View>

      {/* Result reveal */}
      {done && (
        <View style={styles.resultWrapper}>
          <View style={styles.resultShadow} />
          <View style={[styles.result, { backgroundColor: cat.color + '18', borderColor: colors.border }]}>
            <View style={[styles.resultIconBox, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon as any} size={28} color="#fff" />
            </View>
            <View style={styles.resultText}>
              <Text style={[styles.resultCategory, { color: colors.foreground }]}>{cat.label}</Text>
              <View style={[styles.diffBadge, { backgroundColor: diffColor, borderColor: '#111' }]}>
                <Text style={styles.diffText}>{DIFFICULTY_LABELS[selectedDifficulty]}</Text>
                <Text style={styles.diffPoints}>
                  +{selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 2 : 3} pts
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {!done && (
        <View style={styles.spinningIndicator}>
          <Text style={[styles.spinText, { color: colors.mutedForeground }]}>
            {spinning ? '⟳  GIRANDO...' : '⟳  PREPARANDO...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  windowWrapper: {
    width: '100%',
    position: 'relative',
  },
  windowShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  window: {
    width: '100%',
    borderWidth: 3,
    borderRadius: 4,
    overflow: 'hidden',
    height: VISIBLE_ITEMS * ITEM_HEIGHT,
    position: 'relative',
  },
  centerHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    zIndex: 2,
  },
  mask: {
    overflow: 'hidden',
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  catDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  slotText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    opacity: 0.75,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    opacity: 0.75,
    zIndex: 1,
  },
  resultWrapper: {
    width: '100%',
    position: 'relative',
  },
  resultShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 3,
    width: '100%',
  },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    gap: 8,
  },
  resultCategory: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  diffText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  diffPoints: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  spinningIndicator: {
    height: 40,
    justifyContent: 'center',
  },
  spinText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
});
