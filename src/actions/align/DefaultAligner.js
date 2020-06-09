// @flow

import { Aligner } from './Aligner';
import type { Alignment } from './Alignment';
import type { AlignOptions } from '../../Options';

const LEFT_ALIGN = 'left';
const CENTER_ALIGN = 'center';
const RIGHT_ALIGN = 'right';
const FULL_ALIGN = 'full';
const RESET_ALIGN = 'reset';
const INPUT_ALIGN = 'input';

export default class DefaultAligner implements Aligner {
  alignments: { [string]: Alignment };
  alignAttribute: string;
  applyStyle: boolean;
  floatOnParent: Boolean;

  constructor(options: AlignOptions, formatter) {
    this.applyStyle = options.aligner.applyStyle;
    this.floatOnParent = options.aligner.floatOnParent;
    this.alignAttribute = options.attribute;
    this.alignments = {
      [LEFT_ALIGN]: {
        name: LEFT_ALIGN,
        icon: options.icons.left,
        text: '左对齐',
        apply: (el: HTMLElement) => {
        //   this.setStyle(el, 'block', 'left', '0');
          if (el.getAttribute('width') === '100%') {
            el.removeAttribute('width');
          }
          this.setAlignment(el, LEFT_ALIGN);
        },
      },
      [CENTER_ALIGN]: {
        name: CENTER_ALIGN,
        icon: options.icons.center,
        text: '居中对齐',
        apply: (el: HTMLElement) => {
        //   this.setStyle(el, 'block', null, 'auto');
          if (el.getAttribute('width') === '100%') {
            el.removeAttribute('width');
          }
          this.setAlignment(el, CENTER_ALIGN);
        },
      },
      [RIGHT_ALIGN]: {
        name: RIGHT_ALIGN,
        icon: options.icons.right,
        text: '右对齐',
        apply: (el: HTMLElement) => {
        //   this.setStyle(el, 'block', 'right', '0 0 0 auto');
          if (el.getAttribute('width') === '100%') {
            el.removeAttribute('width');
          }
          this.setAlignment(el, RIGHT_ALIGN);
        },
      },
      [FULL_ALIGN]: {
        name: FULL_ALIGN,
        icon: options.icons.full,
        text: '宽度 100%',
        apply: (el: HTMLElement) => {
          this.setAlignment(el, FULL_ALIGN);
          // this.clear(el);
          el.setAttribute('width', '100%');
          if (el.tagName === 'IMG') {
            el.removeAttribute('height');
          }
        },
      },
      [RESET_ALIGN]: {
        name: RESET_ALIGN,
        icon: options.icons.reset,
        text: '重置',
        apply: (el: HTMLElement) => {
          this.setAlignment(el, RESET_ALIGN);
          // this.clear(el);
          el.removeAttribute('width');
          el.removeAttribute('height');
        },
      },
      [INPUT_ALIGN]: {
        name: INPUT_ALIGN,
        icon: options.icons.input,
        text: '自定义宽度和高度',
        apply: (el: HTMLElement) => {
          const { width, height } = el.getBoundingClientRect();
          const res = window.prompt('手动输入宽度和高度', `${Math.round(width)}x${Math.round(height)}`);
          if (!res) return;
          const [newWidth, newHeight] = res.split('x').map(parseFloat);
          if (!isNaN(newWidth)) {
            el.setAttribute('width', `${newWidth}px`);
          }
          if (!isNaN(newHeight)) {
            el.setAttribute('height', `${newHeight}px`);
          }
          formatter.update();
        },
      },
    };
  }

  getAlignments(): Alignment[] {
    return Object.keys(this.alignments).map(k => this.alignments[k]);
  }

  // clear(el: HTMLElement): void {
  //   el.removeAttribute(this.alignAttribute);
  //   this.setStyle(el, null, null, null);
  // }

  isAligned(el: HTMLElement, alignment: Alignment): boolean {
    return el.getAttribute(this.alignAttribute) === alignment.name;
  }

  setAlignment(el: HTMLElement, value: string) {
    el.setAttribute(this.alignAttribute, value);
  }

  // setStyle(el: HTMLElement, display: ?string, float: ?string, margin: ?string) {
  //   if (this.applyStyle) {
  //     el.style.setProperty('display', display);
  //     if (this.floatOnParent) {
  //       if (el.parentNode) {
  //         el.parentNode.style.setProperty('text-align', float);
  //       }
  //     } else if (display !== 'block') {
  //       el.style.setProperty('float', float);
  //     }
  //     el.style.setProperty('margin', margin);
  //   }
  // }
}
