import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface TimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  onExpire?: () => void;
  running: boolean;
}

export function Timer({ totalSeconds, remainingSeconds, running, onExpire }: TimerProps) {
  const colors = useColors();
  const widthAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const prevRunning = useRef(running);
  const prevRemaining = useRef(remainingSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (running && remainingSeconds !== prevRemaining.current) {
      const fraction = remainingSeconds / totalSeconds;
      Animated.timing(widthAnim, {
        toValue: fraction,
        duration: 900,
        useNativeDriver: false,
      }).start();
      Animated.timing(colorAnim, {
        toValue: 1 - fraction,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }
    prevRemaining.current = remainingSeconds;
    prevRunning.current = running;
  }, [remainingSeconds, running, totalSeconds, widthAnim, colorAnim]);

  useEffect(() => {
    if (running && remainingSeconds === 0) {
      onExpireRef.current?.();
    }
  }, [remainingSeconds, running]);

  const barColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#16A34A', '#F59E0B', '#DC2626'],
  });

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const urgent = remainingSeconds <= 10 && running;

  return (
    <View style={styles.container}>
      {/* Track with thick border */}
      <View style={styles.trackWrapper}>
        {/* Hard shadow */}
        <View style={styles.trackShadow} />
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.bar,
              {
                flex: widthAnim,
                backgroundColor: barColor,
              },
            ]}
          />
          <View style={{ flex: Animated.subtract(new Animated.Value(1), widthAnim) as any }} />
        </View>
      </View>

      <Text style={[styles.time, { color: urgent ? '#DC2626' : '#111111' }]}>
        {timeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  trackWrapper: {
    width: '100%',
    position: 'relative',
  },
  trackShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  track: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#F0EBE0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 2,
  },
  time: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
  },
});
