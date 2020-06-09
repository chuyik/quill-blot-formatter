// @flow

import BlotSpec from './BlotSpec';
import BlotFormatter from '../BlotFormatter';

export default class ImageSpec extends BlotSpec {
  target: ?HTMLElement;

  constructor(formatter: BlotFormatter) {
    super(formatter);
    this.target = null;
  }

  init() {
    this.formatter.quill.root.addEventListener('click', this.onClick);
  }

  getTargetElement(): ?HTMLElement {
    return this.target;
  }

  onHide() {
    this.target = null;
  }

  onClick = (event: MouseEvent) => {
    const el = event.target;
    if (!(el instanceof HTMLElement) || el.tagName !== 'IMG') {
      return;
    }

    this.target = el;
    this.formatter.show(this);
  };
}
