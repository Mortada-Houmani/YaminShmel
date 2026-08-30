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
      [0, SWIPE_THRESHOLD * 0.4, SWIPE_THRESHOLD],
      [0, 0.6, 1]
    );
    return {
      opacity,
      transform: [
        {
          scale: interpolate(
            translationX.value,
            [0, SWIPE_THRESHOLD],
            [0.85, 1.05]
          ),
        },
      ],
    };
  });

  const deleteStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.4, 0],
      [1, 0.6, 0]
    );
    return {
      opacity,
      transform: [
        {
          scale: interpolate(
            translationX.value,
            [-SWIPE_THRESHOLD, 0],
            [1.05, 0.85]
          ),
        },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Right / Yamin Badge (KEEP) */}
      <Animated.View style={[styles.badge, styles.keepBadge, keepStyle]}>
        <Check color="#059669" size={20} strokeWidth={3} />
        <Text style={styles.keepText}>KEEP</Text>
      </Animated.View>

      {/* Left / Shmel Badge (DELETE) */}
      <Animated.View style={[styles.badge, styles.deleteBadge, deleteStyle]}>
        <Trash2 color="#DC2626" size={20} strokeWidth={2.5} />
        <Text style={styles.deleteText}>DELETE</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  keepBadge: {
    left: 20,
    borderColor: '#059669',
  },
  keepText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
    letterSpacing: 1,
  },
  deleteBadge: {
    right: 20,
    borderColor: '#DC2626',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
    letterSpacing: 1,
  },
});

