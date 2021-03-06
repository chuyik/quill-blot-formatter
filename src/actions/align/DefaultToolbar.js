// @flow

import { Toolbar } from './Toolbar';
import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import BlotFormatter from '../../BlotFormatter';

export default class DefaultToolbar implements Toolbar {
  toolbar: ?HTMLElement;
  buttons: HTMLElement[];

  constructor() {
    this.toolbar = null;
    this.buttons = [];
  }

  create(formatter: BlotFormatter, aligner: Aligner): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.classList.add(formatter.options.align.toolbar.mainClassName);
    this.addToolbarStyle(formatter, toolbar);
    this.addButtons(formatter, toolbar, aligner);

    this.toolbar = toolbar;
    return this.toolbar;
  }

  destroy() {
    this.toolbar = null;
    this.buttons = [];
  }

  getElement() {
    return this.toolbar;
  }

  addToolbarStyle(formatter: BlotFormatter, toolbar: HTMLElement) {
    if (formatter.options.align.toolbar.mainStyle) {
      Object.assign(toolbar.style, formatter.options.align.toolbar.mainStyle);
    }
  }

  addButtonStyle(button: HTMLElement, index: number, formatter: BlotFormatter) {
    if (formatter.options.align.toolbar.buttonStyle) {
      Object.assign(button.style, formatter.options.align.toolbar.buttonStyle);
      if (index > 0) {
        button.style.borderLeftWidth = '0'; // eslint-disable-line no-param-reassign
      }
    }

    if (formatter.options.align.toolbar.svgStyle) {
      Object.assign(button.children[0].style, formatter.options.align.toolbar.svgStyle);
    }
  }

  addButtons(formatter: BlotFormatter, toolbar: HTMLElement, aligner: Aligner) {
    aligner.getAlignments().forEach((alignment, i) => {
      const button = document.createElement('span');
      button.classList.add(formatter.options.align.toolbar.buttonClassName);
      button.innerHTML = alignment.icon;
      button.addEventListener('click', () => {
        this.onButtonClick(button, formatter, alignment, aligner);
      });
      button.addEventListener('mouseenter', () => {
        const tip = document.createElement('div');
        tip.innerText = alignment.text || alignment.name;
        Object.assign(tip.style, {
          position: 'absolute',
          top: '-20px',
          background: '#2196F3',
          padding: '4px 6px',
          color: '#fff',
          textAlign: 'center',
          display: 'block',
          whiteSpace: 'nowrap',
          transform: 'translateX(-50%)',
          left: '50%',
        });
        button.appendChild(tip);
      });
      button.addEventListener('mouseleave', () => {
        const tip = button.querySelector('div');
        if (tip) {
          button.removeChild(tip);
        }
      });
      this.preselectButton(button, alignment, formatter, aligner);
      this.addButtonStyle(button, i, formatter);
      this.buttons.push(button);
      toolbar.appendChild(button);
    });
  }

  preselectButton(
    button: HTMLElement,
    alignment: Alignment,
    formatter: BlotFormatter,
    aligner: Aligner,
  ) {
    if (!formatter.currentSpec) {
      return;
    }

    const target = formatter.currentSpec.getTargetElement();
    if (!target) {
      return;
    }

    if (aligner.isAligned(target, alignment)) {
      this.selectButton(formatter, button);
    }
  }

  onButtonClick(
    button: HTMLElement,
    formatter: BlotFormatter,
    alignment: Alignment,
    aligner: Aligner,
  ) {
    if (!formatter.currentSpec) {
      return;
    }

    const target = formatter.currentSpec.getTargetElement();
    if (!target) {
      return;
    }

    this.clickButton(button, target, formatter, alignment, aligner);
  }

  clickButton(
    button: HTMLElement,
    alignTarget: HTMLElement,
    formatter: BlotFormatter,
    alignment: Alignment,
    aligner: Aligner,
  ) {
    this.buttons.forEach((b) => { this.deselectButton(formatter, b); });

    const aligned = aligner.isAligned(alignTarget, alignment);
    if (aligned) {
      if (formatter.options.align.toolbar.allowDeselect) {
        // aligner.clear(alignTarget);
      } else {
        this.selectButton(formatter, button);
      }
    } else {
      this.selectButton(formatter, button);
      alignment.apply(alignTarget);
    }

    if (alignment.name !== 'input') {
      const quill = formatter.quill;
      const node = formatter.currentSpec.target;
      if (node) {
        const blot = quill.constructor.find(node);
        if (blot) {
          const idx = quill.getIndex(blot);
          quill.formatLine(idx, 0, 'align', alignment.name === 'left' || alignment.name === 'reset' || aligned ? '' : alignment.name);
        }
      }
      formatter.update();
    }
  }

  selectButton(formatter: BlotFormatter, button: HTMLElement) {
    button.classList.add('is-selected');
    if (formatter.options.align.toolbar.addButtonSelectStyle) {
      button.style.setProperty('filter', 'invert(20%)');
    }
  }

  deselectButton(formatter: BlotFormatter, button: HTMLElement) {
    button.classList.remove('is-selected');
    if (formatter.options.align.toolbar.addButtonSelectStyle) {
      button.style.removeProperty('filter');
    }
  }
}
