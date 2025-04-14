import type { LightningViewElement, Rect } from '@plexinc/react-lightning';
import RLColumn, {
  type ColumnProps as RLColumnProps,
} from '@plexinc/react-lightning-components/layout/Column';
import { createLayoutEvent } from '@plexinc/react-native-lightning';
import { forwardRef, useCallback } from 'react';
import type { ViewProps } from 'react-native';

export interface ColumnProps extends Omit<RLColumnProps, 'onLayout'> {
  onLayout?: ViewProps['onLayout'];
}

const Column = forwardRef<LightningViewElement, ColumnProps>(
  ({ onLayout, ...props }, ref) => {
    const handleLayout = useCallback(
      (rect: Rect) => {
        onLayout?.(createLayoutEvent(rect));
      },
      [onLayout],
    );

    return <RLColumn {...props} ref={ref} onLayout={handleLayout} />;
  },
);

Column.displayName = 'Column';

export default Column;
