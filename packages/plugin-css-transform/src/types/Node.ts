import type { INodeProps } from '@lightningjs/renderer';
import type { LightningElement, RendererNode } from '@plexinc/react-lightning';

export type RendererNodeWithCore = RendererNode<LightningElement> & {
  coreNode: {
    props: INodeProps;
  };
};
