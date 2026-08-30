import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path } from 'react-native-svg';

interface GridBackgroundProps {
  gridSize?: number;
  gridColor?: string;
  backgroundColor?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize = 32,
  gridColor = '#E2E8F0',
  backgroundColor = '#FAFAFA',
}) => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Fine hairline grid lines */}
            <Path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={gridColor}
              strokeWidth={0.8}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </Svg>
    </View>
  );
};
