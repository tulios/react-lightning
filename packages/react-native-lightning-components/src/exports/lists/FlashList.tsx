import { ScrollView } from '@plexinc/react-native-lightning';
import {
  type FlashListProps,
  FlashList as ShopifyFlashList,
} from '@shopify/flash-list';
import { type FC, type Ref, cloneElement, forwardRef } from 'react';
import CellContainer from './CellContainer';

const FlashListProto = ShopifyFlashList.prototype;
const FlashListRenderProperty = Object.getOwnPropertyDescriptor(
  FlashListProto,
  'render',
);

if (!FlashListProto || !FlashListRenderProperty) {
  throw new Error(
    'Failed to override the render method: FlashList prototype or render function is undefined. Ensure that FlashList was added as a dependency.',
  );
}

// We need to override the render method to ensure that
// forceNonDeterministicRendering is set to false. Without it, the FlashList
// will initialize the items in the list with a 0 width/height, which causes all
// items to be rendered on the screen at once.
// See: https://github.com/Shopify/flash-list/discussions/1593
Object.defineProperty(
  FlashListProto,
  'render',
  Object.assign({}, FlashListRenderProperty, {
    value() {
      const renderResult = FlashListRenderProperty.value.call(this);

      return cloneElement(renderResult, {
        children: cloneElement(renderResult.props.children, {
          forceNonDeterministicRendering: false,
        }),
      });
    },
  }),
);

type FlashList<T> = ShopifyFlashList<T>;

interface ForwardRef extends FC<FlashListProps<unknown>> {
  <T = unknown>(
    props: FlashListProps<T> & { ref: Ref<FlashList<T>> },
  ): ReturnType<FC<FlashListProps<T>>>;
}

const FlashList: ForwardRef = forwardRef(
  <T,>(
    {
      CellRendererComponent,
      renderScrollComponent,
      ...props
    }: FlashListProps<T>,
    ref: Ref<ShopifyFlashList<T>>,
  ) => (
    <ShopifyFlashList
      CellRendererComponent={CellRendererComponent ?? CellContainer}
      renderScrollComponent={renderScrollComponent ?? ScrollView}
      ref={ref}
      {...props}
    />
  ),
);

FlashList.displayName = 'LightningFlashList';

export type { FlashListProps };

export default FlashList;
