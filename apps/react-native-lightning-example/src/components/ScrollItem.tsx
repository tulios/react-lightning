import { focusable } from '@plexinc/react-lightning';
import { View } from '@plexinc/react-native-lightning';
import { type ReactNode, useEffect, useMemo } from 'react';
import { type ColorValue, Text } from 'react-native';

export type ScrollItemProps = {
  children: ReactNode;
  index: number;
  horizontal?: boolean;
  color: ColorValue;
  altColor: ColorValue;
  onFocused: (index: number) => void;
};

const ScrollItem = focusable<ScrollItemProps, View>(
  (
    { color, altColor, index, horizontal, focused, children, onFocused },
    ref,
  ) => {
    useEffect(() => {
      if (focused) {
        onFocused(index);
      }
    }, [index, focused, onFocused]);

    const multiplier = useMemo(() => (index % 3 === 0 ? 1.25 : 1), [index]);
    const finalColor = useMemo(
      () => (index % 3 === 0 ? altColor : color),
      [index, color, altColor],
    );

    return (
      <View
        ref={ref}
        style={{
          width: horizontal ? 75 * multiplier : 200,
          height: horizontal ? 200 : 75 * multiplier,
          borderWidth: focused ? 0 : 1,
          borderStyle: 'solid',
          borderColor: finalColor,
          backgroundColor: focused ? finalColor : 'transparent',
          display: 'flex' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            color: focused ? 'black' : color,
            transform: `rotate(${horizontal ? '-90deg' : '0deg'})`,
          }}
        >
          {children}
        </Text>
      </View>
    );
  },
);

export default ScrollItem;
