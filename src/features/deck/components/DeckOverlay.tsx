import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { Check, Trash2 } from 'lucide-react-native';

interface DeckOverlayProps {
  translationX: SharedValue<number>;
  SWIPE_THRESHOLD: number;
}

export const DeckOverlay: React.FC<DeckOverlayProps> = ({ translationX, SWIPE_THRESHOLD }) => {
  const keepStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1]
    );
    return {
      opacity,
      transform: [
        {
          scale: interpolate(
            translationX.value,
            [0, SWIPE_THRESHOLD],
            [0.8, 1.1]
          ),
        },
      ],
    };
  });

  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0]
    );
    return {
      opacity,
      transform: [
        {
          scale: interpolate(
            translationX.value,
            [-SWIPE_THRESHOLD, 0],
            [1.1, 0.8]
          ),
        },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Right / Yamin Badge (KEEP) */}
      <Animated.View style={[styles.badge, styles.keepBadge, keepStyle]}>
        <Check color="#10B981" size={24} strokeWidth={3} />
        <Text style={styles.keepText}>YAMIN (KEEP)</Text>
      </Animated.View>

      {/* Left / Shmel Badge (DELETE) */}
      <Animated.View style={[styles.badge, styles.deleteBadge, deleteStyle]}>
        <Trash2 color="#EF4444" size={24} strokeWidth={3} />
        <Text style={styles.deleteText}>SHMEL (DELETE)</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    zIndex: 100,
  },
  keepBadge: {
    left: 24,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  keepText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  deleteBadge: {
    right: 24,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
