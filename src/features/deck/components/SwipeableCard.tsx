import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MediaAsset, SwipeDirection } from '../../../types/media';
import { DeckOverlay } from './DeckOverlay';
import { formatBytes } from '../../media/services/mediaService';
import { Calendar, HardDrive, Maximize2 } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

interface SwipeableCardProps {
  asset: MediaAsset;
  index: number; // 0 = current top card, 1 = next, 2 = next+1
  onSwipe: (direction: SwipeDirection) => void;
  isTopCard: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  asset,
  index,
  onSwipe,
  isTopCard,
}) => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const triggerHaptics = (type: 'light' | 'medium') => {
    try {
      if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.selectionAsync();
      }
    } catch {
      // Haptics optional
    }
  };

  const handleSwipeComplete = (direction: SwipeDirection) => {
    triggerHaptics('medium');
    onSwipe(direction);
  };

  const gesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction: SwipeDirection = event.translationX > 0 ? 'right' : 'left';
        const targetX = event.translationX > 0 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translationX.value = withTiming(targetX, { duration: 250 }, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
      } else {
        translationX.value = withSpring(0, { damping: 18, stiffness: 180 });
        translationY.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (!isTopCard) {
      // Stack effect for lower cards
      const scale = interpolate(index, [1, 2], [0.94, 0.88]);
      const translateY = interpolate(index, [1, 2], [14, 28]);
      return {
        transform: [{ scale }, { translateY }],
        opacity: interpolate(index, [1, 2], [0.85, 0.6]),
      };
    }

    const rotate = interpolate(
      translationX.value,
      [-SCREEN_WIDTH, SCREEN_WIDTH],
      [-16, 16]
    );

    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: 1,
    };
  });

  const formattedDate = new Date(asset.creationTime).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { zIndex: 10 - index },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View style={styles.cardInner}>
          <Image
            source={{ uri: asset.uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />

          {/* Dynamic Swipe Badges (Top Card Only) */}
          {isTopCard && (
            <DeckOverlay
              translationX={translationX}
              SWIPE_THRESHOLD={SWIPE_THRESHOLD}
            />
          )}

          {/* Card Bottom Meta Card */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Calendar size={14} color="#94A3B8" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>

              <View style={styles.metaBadge}>
                <Maximize2 size={14} color="#94A3B8" />
                <Text style={styles.metaText}>
                  {asset.width} × {asset.height}
                </Text>
              </View>

              {asset.filesize && (
                <View style={styles.metaBadge}>
                  <HardDrive size={14} color="#94A3B8" />
                  <Text style={styles.metaText}>{formatBytes(asset.filesize)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  cardInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
  },
  metaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
