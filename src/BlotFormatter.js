// @flow

import deepmerge from 'deepmerge';
import type { Options } from './Options';
import DefaultOptions from './Options';
import Action from './actions/Action';
import BlotSpec from './specs/BlotSpec';

const dontMerge = (destination: Array<any>, source: Array<any>) => source;

export default class BlotFormatter {
  quill: any;
  options: Options;
  currentSpec: ?BlotSpec;
  specs: BlotSpec[];
  overlay: HTMLElement;
  actions: Action[];

  constructor(quill: any, options: $Shape<Options> = {}) {
    this.quill = quill;
    this.options = deepmerge(DefaultOptions, options, { arrayMerge: dontMerge });
    this.currentSpec = null;
    this.actions = [];
    this.overlay = document.createElement('div');
    this.overlay.classList.add(this.options.overlay.className);
    if (this.options.overlay.style) {
      Object.assign(this.overlay.style, this.options.overlay.style);
    }

    // disable native image resizing on firefox
    document.execCommand('enableObjectResizing', false, 'false'); // eslint-disable-line no-undef
    this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';

    this.quill.root.addEventListener('click', this.onClick);
    this.specs = this.options.specs.map((SpecClass: Class<BlotSpec>) => new SpecClass(this));
    this.specs.forEach(spec => spec.init());
    this.sizeElems = document.createElement('div');
    this.sizeElems.style.cssText = 'position:absolute;right:0px;top:0px;pointer-events:none;user-select:none;background:#737070;padding:8px;font-size:16px;color:#ffffff;';
    this.sizeElems.innerHTML = '<span></span>x<span></span>';
    this.overlay.appendChild(this.sizeElems);
  }

  show(spec: BlotSpec) {
    this.currentSpec = spec;
    this.currentSpec.setSelection();
    this.setUserSelect('none');
    this.quill.root.parentNode.appendChild(this.overlay);
    this.repositionOverlay();
    this.createActions(spec);
  }

  hide() {
    if (!this.currentSpec) {
      return;
    }

    this.currentSpec.onHide();
    this.currentSpec = null;
    this.quill.root.parentNode.removeChild(this.overlay);
    this.overlay.style.setProperty('display', 'none');
    this.setUserSelect('');
    this.destroyActions();
  }

  update() {
    this.repositionOverlay();
    this.actions.forEach(action => action.onUpdate());
  }

  createActions(spec: BlotSpec) {
    this.actions = spec.getActions().map((ActionClass: Class<Action>) => {
      const action: Action = new ActionClass(this);
      action.onCreate();
      return action;
    });
  }

  destroyActions() {
    this.actions.forEach((action: Action) => action.onDestroy());
    this.actions = [];
  }

  repositionOverlay() {
    if (!this.currentSpec) {
      return;
    }

    const overlayTarget = this.currentSpec.getOverlayElement();
    if (!overlayTarget) {
      return;
    }

    const parent: HTMLElement = this.quill.root.parentNode;
    const specRect = overlayTarget.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      display: 'block',
      left: `${specRect.left - parentRect.left - 1 + parent.scrollLeft}px`,
      top: `${specRect.top - parentRect.top + parent.scrollTop}px`,
      width: `${specRect.width}px`,
      height: `${specRect.height}px`,
    });
    this.sizeElems.querySelector('span:first-child').innerText = Math.round(specRect.width);
    this.sizeElems.querySelector('span:last-child').innerText = Math.round(specRect.height);
  }

  setUserSelect(value: string) {
    const props: string[] = [
      'userSelect',
      'mozUserSelect',
      'webkitUserSelect',
      'msUserSelect',
    ];

    props.forEach((prop: string) => {
      // set on contenteditable element and <html>
      this.quill.root.style.setProperty(prop, value);
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }

  onClick = () => {
    this.hide();
  }
}
