import type { Rect } from '@plexinc/react-lightning';
import React from 'react';
import type { LayoutChangeEvent, ListRenderItem } from 'react-native';
import { FocusGroup } from '../FocusGroup';

type VirtualizedListItemProps<T> = {
  item: T;
  index: number;
  renderItem: ListRenderItem<T>;
  onLayoutUpdated?: (index: number, layout: Rect) => void;
  onFocus?: () => void;
};

export default class VirtualizedListItem<T> extends React.Component<
  VirtualizedListItemProps<T>
> {
  _layoutUpdated = (event: LayoutChangeEvent) => {
    this.props.onLayoutUpdated?.(this.props.index, event.nativeEvent.layout);
  };

  render() {
    return (
      <FocusGroup onLayout={this._layoutUpdated} onFocus={this.props.onFocus}>
        {
          this.props.renderItem({
            item: this.props.item,
            index: this.props.index,
            separators: {
              highlight: () => {},
              unhighlight: () => {},
              updateProps: () => {},
            },
          }) as unknown as React.ReactNode
        }
      </FocusGroup>
    );
  }
}
