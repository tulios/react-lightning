import type {
  LightningImageElementProps,
  LightningTextElementProps,
  LightningViewElementProps,
} from '@plexinc/react-lightning';
import type { AllStyleProps } from './ReactStyle';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lng-view': LightningViewElementProps & {
        style?: AllStyleProps;
      };
      'lng-image': LightningImageElementProps & {
        style?: AllStyleProps;
      };
      'lng-text': LightningTextElementProps & {
        style?: AllStyleProps;
      };
    }
  }
}
