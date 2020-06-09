// @flow

import BlotSpec from './BlotSpec';
import BlotFormatter from '../BlotFormatter';

const MOUSE_ENTER_ATTRIBUTE = 'data-blot-formatter-unclickable-bound';
const PROXY_IMAGE_CLASS = 'blot-formatter__proxy-image';

export default class UnclickableBlotSpec extends BlotSpec {
  selector: string;
  target: ?HTMLElement;
  nextTarget: ?HTMLElement;
  proxyImage: HTMLImageElement;

  constructor(formatter: BlotFormatter, selector: string) {
    super(formatter);
    this.selector = selector;
    this.target = null;
    this.nextTarget = null;
  }

  init() {
    if (document.body) {
      /*
      it's important that this is attached to the body instead of the root quill element.
      this prevents the click event from overlapping with ImageSpec
       */
      document.body.appendChild(this.createProxyImage());
    }

    this.hideProxyImage();
    this.proxyImage.addEventListener('click', this.onProxyImageClick);
    this.formatter.quill.on('text-change', this.onTextChange);
  }

  getTargetElement(): ?HTMLElement {
    return this.target;
  }

  getOverlayElement(): ?HTMLElement {
    return this.target;
  }

  onHide() {
    this.hideProxyImage();
    this.nextTarget = null;
    this.target = null;
  }

  createProxyImage(): HTMLElement {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.globalAlpha = 0;
    context.fillRect(0, 0, 1, 1);

    this.proxyImage = document.createElement('img');
    this.proxyImage.src = canvas.toDataURL('image/png');
    this.proxyImage.setAttribute('draggable', 'false');
    this.proxyImage.classList.add(PROXY_IMAGE_CLASS);

    Object.assign(this.proxyImage.style, {
      position: 'absolute',
      margin: '0',
    });

    return this.proxyImage;
  }

  hideProxyImage() {
    Object.assign(this.proxyImage.style, {
      display: 'none',
    });
  }

  repositionProxyImage(target: HTMLElement) {
    const rect = target.getBoundingClientRect();

    Object.assign(
      this.proxyImage.style,
      {
        display: 'block',
        left: `${rect.left + window.pageXOffset}px`,
        top: `${rect.top + window.pageYOffset}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      },
    );
  }

  onTextChange = () => {
    Array.from(document.querySelectorAll(`${this.selector}:not([${MOUSE_ENTER_ATTRIBUTE}])`))
      .forEach((target) => {
        target.setAttribute(MOUSE_ENTER_ATTRIBUTE, 'true');
        target.addEventListener('mouseenter', this.onMouseEnter);
      });
  };

  onMouseEnter = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    this.nextTarget = target;
    this.repositionProxyImage(this.nextTarget);
  }

  onProxyImageClick = () => {
    this.target = this.nextTarget;
    this.nextTarget = null;
    this.formatter.show(this);
    this.hideProxyImage();
  };
}
