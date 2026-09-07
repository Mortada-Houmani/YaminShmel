import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
// Shorter swipe threshold (~70px on modern screens) plus flick velocity detection
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.18;
const VELOCITY_THRESHOLD = 400;
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.64;

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
      const isRight =
        event.translationX > SWIPE_THRESHOLD ||
        (event.velocityX > VELOCITY_THRESHOLD && event.translationX > 20);

      const isLeft =
        event.translationX < -SWIPE_THRESHOLD ||
        (event.velocityX < -VELOCITY_THRESHOLD && event.translationX < -20);

      if (isRight || isLeft) {
        const direction: SwipeDirection = isRight ? 'right' : 'left';
        const targetX = isRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translationX.value = withTiming(targetX, { duration: 200 }, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
      } else {
        translationX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translationY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (!isTopCard) {
      // Clean stack progression for background cards
      const scale = interpolate(index, [1, 2], [0.95, 0.90]);
      const translateY = interpolate(index, [1, 2], [12, 24]);
      return {
        transform: [{ scale }, { translateY }],
        opacity: interpolate(index, [1, 2], [0.9, 0.75]),
      };
    }

    const rotate = interpolate(
      translationX.value,
      [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5],
      [-12, 12]
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

          {/* Card Bottom Meta Pill Bar */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Calendar size={13} color="#64748B" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>

              <View style={styles.metaBadge}>
                <Maximize2 size={13} color="#64748B" />
                <Text style={styles.metaText}>
                  {asset.width}×{asset.height}
                </Text>
              </View>

              {asset.filesize && (
                <View style={styles.metaBadge}>
                  <HardDrive size={13} color="#64748B" />
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
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  metaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginLeft: 5,
    letterSpacing: 0.2,
  },
});

