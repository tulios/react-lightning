import type { LightningElement } from '@plexinc/react-lightning';
import { View, type ViewProps } from '@plexinc/react-native-lightning';
import { forwardRef } from 'react';

const CellContainer = forwardRef<LightningElement, ViewProps>((props, ref) => (
  // We need to not set overflow: 'hidden' on the cell view, otherwise the
  // FlashList will not render the items correctly.
  <View {...props} ref={ref} style={[props.style, { overflow: 'visible' }]} />
));

CellContainer.displayName = 'LightningCellContainer';

export default CellContainer;
