import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { StyleProp, ViewStyle } from 'react-native';

import React from 'react';

const { View } = Animated;

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export default ({ children, style, delay }: Props) => {
  return (
    <View entering={FadeInRight.springify().delay(delay ?? 0)} exiting={FadeOutLeft.springify()} style={style}>
      {children}
    </View>
  );
};
