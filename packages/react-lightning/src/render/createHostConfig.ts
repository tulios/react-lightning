import type { RendererMain } from '@lightningjs/renderer';
import type { Fiber, HostConfig } from 'react-reconciler';
import { DefaultEventPriority } from 'react-reconciler/constants';
import { LightningTextElement } from '../element/LightningTextElement';
import { createLightningElement } from '../element/createLightningElement';
import {
  type LightningElement,
  type LightningElementProps,
  LightningElementType,
  type RendererNode,
} from '../types';
import { simpleDiff } from '../utils/simpleDiff';
import type { Plugin } from './Plugin';
import { mapReactPropsToLightning } from './mapReactPropsToLightning';

export type LightningHostConfig = HostConfig<
  LightningElementType, // Type
  LightningElementProps, // Props
  RendererMain, // Container
  LightningElement, // Instance
  LightningTextElement, // TextInstance
  null, // SuspenseInstance
  null, // HydratableInstance
  LightningElement, // FormInstance
  LightningElement, // PublicInstance
  LightningElementProps, // HostContext
  unknown, // ChildSet
  number | undefined, // TimeoutHandle
  -1, // NoTimeout
  null // TransitionStatus
>;

type LightningHostConfigOptions = Pick<
  LightningHostConfig,
  'isPrimaryRenderer'
>;

const NO_CONTEXT = {};

export function createHostConfig(
  renderer: RendererMain,
  plugins: Plugin<LightningElement>[],
  options?: LightningHostConfigOptions,
): LightningHostConfig {
  function appendChild(
    parentInstance: LightningElement,
    child: LightningElement,
  ) {
    if (child.parent !== parentInstance) {
      parentInstance.insertChild(child);
    }
  }

  return {
    isPrimaryRenderer: options?.isPrimaryRenderer ?? true,
    warnsIfNotActing: false,
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    supportsMicrotasks: true,
    scheduleMicrotask: queueMicrotask,
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    preparePortalMount: () => {},
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur: () => {},
    afterActiveInstanceBlur: () => {},
    prepareScopeUpdate: () => {},

    getRootHostContext(_rootContainer: RendererMain) {
      return NO_CONTEXT;
    },

    getChildHostContext(
      parentHostContext: LightningElementProps,
      _type: LightningElementType,
      _rootContainer: RendererMain,
    ) {
      return parentHostContext;
    },

    getPublicInstance(instance: LightningElement) {
      return instance;
    },

    appendInitialChild: appendChild,
    appendChild,

    appendChildToContainer(container: RendererMain, child: LightningElement) {
      if (container.root) {
        const oldNode = child.node;
        const root =
          container.root as unknown as RendererNode<LightningElement>;

        child.node = root;

        for (const c of child.children) {
          c.parent = child;
        }

        // biome-ignore lint/suspicious/noExplicitAny: TODO
        (window as any).rootElement = child;

        oldNode.destroy();
      }
    },

    createInstance(
      type: LightningElementType,
      props: LightningElementProps,
      _rootContainer: RendererMain,
      _hostContext: LightningElementProps,
      internalHandle: Fiber,
    ) {
      const lngProps = mapReactPropsToLightning(type, props);
      const instance = createLightningElement(
        type,
        lngProps,
        renderer,
        plugins,
        internalHandle,
      );

      return instance;
    },

    createTextInstance(
      text: string,
      _rootContainer: RendererMain,
      _hostContext: LightningElementProps,
      internalHandle: Fiber,
    ) {
      return new LightningTextElement(
        { text },
        renderer,
        plugins,
        internalHandle,
      );
    },

    finalizeInitialChildren() {
      return false;
    },

    prepareForCommit() {
      return null;
    },

    resetAfterCommit(_container: RendererMain) {
      // Noop
    },

    resetTextContent(instance: LightningTextElement) {
      if (instance.isTextElement) {
        (instance as LightningTextElement).text = '';
      }
    },

    getInstanceFromScope(instance) {
      return instance as LightningElement;
    },

    shouldSetTextContent(type: LightningElementType) {
      return type === LightningElementType.Text;
    },

    getCurrentUpdatePriority() {
      return DefaultEventPriority;
    },

    resolveUpdatePriority() {
      return DefaultEventPriority;
    },

    setCurrentUpdatePriority(_priority: number) {
      // noop
    },

    insertBefore(
      parentInstance: LightningElement,
      child: LightningElement,
      beforeChild: LightningElement,
    ) {
      if (child === beforeChild) {
        throw new Error('Can not insert node before itself');
      }

      parentInstance.insertChild(child, beforeChild);
    },

    insertInContainerBefore() {},

    removeChild(parentInstance: LightningElement, child: LightningElement) {
      if (child) {
        parentInstance.removeChild(child);
        child.destroy();
      }
    },

    clearContainer() {},

    removeChildFromContainer() {},

    detachDeletedInstance() {},

    commitUpdate(
      instance: LightningElement,
      type: LightningElementType,
      prevProps: LightningElementProps,
      nextProps: LightningElementProps,
      _internalHandle: Fiber,
    ) {
      let diffedProps: Partial<LightningElementProps> | null = simpleDiff(
        prevProps,
        nextProps,
        { ignore: ['children'] },
      );

      if (nextProps.children && nextProps.children !== prevProps.children) {
        if (diffedProps === null) {
          diffedProps = {
            children: nextProps.children,
          };
        } else {
          diffedProps.children = nextProps.children;
        }
      }

      if (!diffedProps) {
        return;
      }

      const updatePayload = mapReactPropsToLightning(type, diffedProps);
      if (Object.keys(updatePayload).length === 0) {
        return;
      }

      instance.setProps(updatePayload);
    },

    commitTextUpdate(
      instance: LightningElement,
      oldText: string,
      newText: string,
    ) {
      if (instance.isTextElement && oldText !== newText) {
        (instance as LightningTextElement).text = newText;
      }
    },

    hideInstance(instance: LightningElement) {
      instance.style.alpha = 0;
    },

    hideTextInstance(textInstance: LightningTextElement) {
      textInstance.style.alpha = 0;
    },

    unhideInstance(instance: LightningElement) {
      // Probably need to make this a different property so that we don't
      // override user-specified alpha values
      instance.style.alpha = 1;
    },

    unhideTextInstance(textInstance: LightningTextElement): void {
      textInstance.style.alpha = 1;
    },

    maySuspendCommit() {
      return false;
    },

    shouldAttemptEagerTransition() {
      return false;
    },

    requestPostPaintCallback() {
      return {};
    },

    waitForCommitToBeReady() {
      return null; // Return `null` if the commit can happen immediately.
    },

    preloadInstance() {
      return false;
    },

    startSuspendingCommit() {
      // noop
    },

    suspendInstance() {
      // noop
    },

    resetFormInstance() {
      // noop
    },

    trackSchedulerEvent() {
      // noop
    },

    resolveEventType() {
      return null;
    },

    resolveEventTimeStamp() {
      return -1.1;
    },

    NotPendingTransition: null,
    HostTransitionContext: {
      $$typeof: Symbol.for('react.context'),
      // biome-ignore lint/suspicious/noExplicitAny: We won't support transitions, so this is the simplest mock object
      Consumer: null as any,
      // biome-ignore lint/suspicious/noExplicitAny: We won't support transitions, so this is the simplest mock object
      Provider: null as any,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    },
  };
}
