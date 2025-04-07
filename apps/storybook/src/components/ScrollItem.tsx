import { focusable } from '@plexinc/react-lightning';
import { View } from '@plexinc/react-native-lightning';
import { type ReactNode, useEffect } from 'react';
import { type ColorValue, Text } from 'react-native';

export type ScrollItemProps = {
  children: ReactNode;
  index: number;
  width?: number;
  height?: number;
  horizontal?: boolean;
  color: ColorValue;
  onFocused: (index: number) => void;
};

const ScrollItem = focusable<ScrollItemProps, View>(
  (
    {
      color,
      index,
      horizontal,
      width = 200,
      height = 75,
      focused,
      children,
      onFocused,
    },
    ref,
  ) => {
    useEffect(() => {
      if (focused) {
        onFocused(index);
      }
    }, [index, focused, onFocused]);

    return (
      <View
        ref={ref}
        style={{
          width: horizontal ? height : width,
          height: horizontal ? width : height,
          borderWidth: focused ? 0 : 1,
          borderStyle: 'solid',
          borderColor: color,
          borderRadius: 4,
          backgroundColor: focused ? color : 'transparent',
          display: 'flex' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }}
      >
        <Text
          style={{
            fontSize: 12,
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
