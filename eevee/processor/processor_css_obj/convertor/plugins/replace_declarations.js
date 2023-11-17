const removeProperty = require('../utils/remove_property.js');

const notSupportPro = [
  'cursor',
  'transition',
  'border-bottom',
  'border-top',
  'float',
  'overflow',
  'border-right',
  'max-width',
  'box-shadow',
  'letter-spacing',
  'vertical-align',
  'animation',
  'box-sizing',
  'content',
  'font-family',
  'pointer-events',
  'white-space',
  'word-break',
  'max-height',
  'text-shadow',
  'transform-origin',
  'object-fit',
  'overflow-x',
  'overflow-y',
  'flex-flow',
  'font-stretch',
  '-webkit-overflow-scrolling',
  '-webkit-tap-highlight-color',
  '-webkit-line-clamp',
  '-webkit-box-orient',
  '-webkit-box-flex',
  '-webkit-box-align',
  '-webkit-line-clamp',
];

const autoVal = [
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-buttom',
  'flex',
  'width',
];

const alignItemsVal = ['stretch', 'flex-start', 'flex-end', 'center'];

module.exports = function replaceSelectors() {
  return (root) => {
    root.stylesheet.rules.forEach((rule) => {
      if (rule.type === 'rule') {
        for (let i = 0; i < rule.declarations.length; ) {
          let declaration = rule.declarations[i];
          if (declaration.type === 'declaration') {
            if (declaration.property === 'background') {
              if (
                declaration.value.startsWith('rgb') ||
                declaration.value.startsWith('#') ||
                declaration.value === 'transparent'
              ) {
                /**
                 * Convert `background` to `background-color`
                 */
                declaration.property = 'background-color';
              }
            } else if (
              declaration.property === 'text-align' &&
              declaration.value === 'center'
            ) {
              /**
               * Convert `text-align` to `justify-content`
               */
              declaration.property = 'justify-content';
            } else if (declaration.property === 'position') {
              /**
               * Convert `position` to `position: fixed`
               */
              declaration.value = 'fixed';
            } else if (declaration.property === 'display') {
              /**
               * Convert `display: xxx` to `display: flex`
               */
              declaration.value = 'flex';
            } else if (~declaration.value.indexOf('rgb')) {
              /**
               * del rgb() or rgba()
               */
              i = removeProperty(declaration, i, rule.declarations);
            } else if (notSupportPro.includes(declaration.property)) {
              /**
               * del notsupportproperty
               */
              i = removeProperty(declaration, i, rule.declarations);
            } else if (
              autoVal.includes(declaration.property) &&
              ~declaration.value.indexOf('auto')
            ) {
              /**
               * del xxx: auto;
               */
              i = removeProperty(declaration, i, rule.declarations);
            } else if (
              declaration.property === 'align-items' &&
              !alignItemsVal.includes(declaration.value)
            ) {
              /**
               * `align-items`(有效枚举值为: `stretch`|`flex-start`|`flex-end`|`center`)
               */
              i = removeProperty(declaration, i, rule.declarations);
            } else if (
              declaration.property === 'line-height' &&
              typeof declaration.value !== 'number'
            ) {
              /**
               * 属性 `line-height`(仅支持数值)
               */
              i = removeProperty(declaration, i, rule.declarations);
            }
          }
          i++;
        }
      }
    });
    return root;
  };
};
