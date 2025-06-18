import type { Dimensions } from '@lightningjs/renderer';
import type {
  LightningTextElement,
  LightningTextElementStyle,
  Rect,
} from '@plextv/react-lightning';
import { forwardRef, useCallback, useMemo } from 'react';
import type { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { createLayoutEvent } from '../utils/createLayoutEvent';
import type { ViewProps } from './View';

export type TextProps = AddMissingProps<ViewProps, RNTextProps> & {
  onLoaded?: (dimensions: Rect) => void;
};

const defaultTextStyle: Partial<LightningTextElementStyle> = {
  // contain: 'width',
  fontWeight: 'normal',
};

export type Text = RNText & LightningTextElement;

export const Text = forwardRef<LightningTextElement, TextProps>(
  (
    {
      onLoaded,
      onLayout,
      children,
      ellipsizeMode,
      numberOfLines,
      style,
      ...otherProps
    },
    ref,
  ) => {
    const onTextLoaded = useCallback(
      (dimensions: Dimensions) => {
        onLoaded?.({ ...dimensions, x: 0, y: 0 });
      },
      [onLoaded],
    );

    const onTextLayout = useCallback(
      (dimensions: Rect) => {
        onLayout?.(createLayoutEvent(dimensions));
      },
      [onLayout],
    );

    const overflowStyle = useMemo(() => {
      const overflow: LightningTextElementStyle = {
        maxLines: numberOfLines,
      };
      if (ellipsizeMode === 'clip') {
        overflow.textOverflow = 'clip';
        overflow.contain = 'width';
      } else if (ellipsizeMode === 'tail') {
        overflow.textOverflow = 'ellipsis';
        overflow.contain = 'width';
      }
      return overflow;
    }, [ellipsizeMode, numberOfLines]);

    // plugins/reactNativePolyfillsPlugin.ts is handling the flattening, check Image.tsx
    // for more details on the cast to any.

    const finalStyle = [
      defaultTextStyle,
      overflowStyle,
      style as LightningTextElementStyle,
      // biome-ignore lint/suspicious/noExplicitAny: explanation in the comment above
    ] as any;

    return (
      <lng-text
        ref={ref}
        {...otherProps}
        style={finalStyle}
        onLayout={onTextLayout}
        onTextureReady={onTextLoaded}
      >
        {children}
      </lng-text>
    );
  },
);

Text.displayName = 'Text';
