const traverseReplace = require('../utils/traverse_replace.js');
const {createDeclaration} = require('../utils/create_css_node.js');

const colorMapping = require('../utils/color_mapping.js');
const backgoundDefault = {
  'background-attachment': 'scroll',
  'background-color': 'transparent',
  'background-image': 'none',
  'background-origin': 'padding-box',
  'background-clip': 'border-box',
  'background-position-x': '0',
  'background-position-y': '0',
  'background-repeat': 'repeat',
  'background-size-width': 'auto',
  'background-size-height': 'auto',
};

module.exports = () => {
  /**
   * background 缩写展开插件
   * @param {Object} root 
   */
  function plugin(root) {
    traverseReplace(root, replacer, filter);
  }
  /**
   * background 节点替换成展开形式
   * @param {Object} node 
   * @param {Array} container 
   */
  function replacer(node, container) {
    if (node.property === 'background-size') {
      return replacerSize(node, container);
    }
    else if (node.property === 'background-position') {
      return replacerPosition(node, container);
    }
    // 剔除rgb中空格
    const nodeValue = (node.value || '').replace(/(^(rgba?)(\([^\)]*\)))/, str => str.replace(/\s+/g, ''));
    // 1.分离属性值
    const values = nodeValue.split(/\s+/g);
    // 2.获得分离属性
    let longhandProperties = backgroundLonghand(values);
    // 3.创建属性节点
    let replaceNodes = Object.keys(longhandProperties).map(key => {
      return createDeclaration(key, longhandProperties[key], node.parent);
    });
    // 4.替换属性节点
    if (replaceNodes && replaceNodes.length) {
      let pos = container.indexOf(node);
      if (pos !== -1) {
        container.splice(pos, 1, ...replaceNodes);
        return true;
      }
    }
  }
  function replacerSize(node, container) {
      // 1.分离属性值
      const values = (node.value || '').split(/\s+/g);
      // 2.创建替换标签
      const replaceNodes = [
        createDeclaration('backgroundSizeWidth', values[0] || 'auto', node.parent),
        createDeclaration('backgroundSizeHeight', values[1] || 'auto', node.parent),
      ];
      // 3.替换节点
      let pos = container.indexOf(node);
      if (pos !== -1) {
        container.splice(pos, 1, ...replaceNodes);
        return true;
      }
  }
  function replacerPosition(node, container) {
      // 1.分离属性值
      let values = (node.value || '').split(/\s+/g);
      values = replaceValues(values);
      // 2.创建替换标签
      const replaceNodes = [
        createDeclaration('backgroundPositionX', values[0] || '50%', node.parent),
        createDeclaration('backgroundPositionY', values[1] || '50%', node.parent),
      ];
      // 3.替换节点
      let pos = container.indexOf(node);
      if (pos !== -1) {
        container.splice(pos, 1, ...replaceNodes);
        return true;
      }
  }
  /**
   * 满足替换条件触发
   * @param {Object} node 
   */
  function filter(node) {
    return (
      node && 
      node.type === 'declaration' && 
      (node.property === 'background' || node.property === 'background-size' || node.property === 'background-position')
    );
  }
  /**
   * 背景展开
   * - pre前置处理器  前置处理简单属性
   * - post后置处理器 处理位置关联的复杂属性
   * @param {Array} valueArray 
   */
  function backgroundLonghand(valueArray) {
    let ret = {},
        postValues = [];
    for (let i = 0; i < valueArray.length; i++) {
      // 1.前置处理器识别属性
      let propertyName = preRecognizeProperty(valueArray[i]);
      if (propertyName) {
        ret[propertyName] = valueArray[i];
      } else {
        if (valueArray[i].indexOf('/') !== -1) {
          let vals = valueArray[i].split('/');
          vals.splice(1, 0, '/');
          postValues.push(...vals.filter(item => item));
        } else {
          postValues.push(valueArray[i]);
        }
      }
    }
    // 2.后置处理器识别属性
    if (postValues.length !== 0) {
      ret = Object.assign(ret, postRecognizeProperty(postValues));
    }
    // 3.补全未填写的参数
    return complementValues(ret);
  }
  /**
   * 前置属性识别器
   * - background-color	 (颜色名|rgb|rgba|transparent|#)
   * - background-repeat (repeat|repeat-x|repeat-y|no-repeat)
   * - background-attachment (scroll|fixed)
   * - background-image (url('URL')|none|linear-gradient)
   * @description 1.尝试先识别颜色 2.尝试识别背景图 3.其他属性
   * @param {string} value 
   */
  function preRecognizeProperty(value) {
    // 识别 background-color
    if (/^(rgb|#).*/.test(value) || colorMapping[value]) {
      return 'background-color';
    }
    // 识别 background-image
    else if (/^(url|linear).*/.test(value)) {
      return 'background-image';
    }
    // 识别 background-repeat|background-attachment 
    switch (value) {
      case 'repeat':
      case 'repeat-x':
      case 'repeat-y':
      case 'no-repeat':
        return 'background-repeat';
      case 'scroll':
      case 'fixed':
        return 'background-attachment';
      default:
        break;
    }
    return null;
  }
  /**
   * 后置属性识别器
   * - background-position (left top|x% y%|xpos ypos)
   * - background-size   (length|percentage|cover|contain)
   * - background-origin (padding-box|border-box|content-box)
   * - background-clip   (padding-box|border-box|content-box)
   * @param {Array} valueArray 
   */
  function postRecognizeProperty(valueArray) {
    let ret = {};
    let hasRecPos = false,
        hasRecOri = false;
    let numValReg = /.*(%|em|px)/,
        sizeTpReg = /auto|cover|contain/,
        boxModReg = /padding-box|border-box|content-box/;
    valueArray = arrangeValues(valueArray);
    valueArray = replaceValues(valueArray);
    for (let i = 0; i < valueArray.length; i++) {
      let value = valueArray[i],
          nextValue = valueArray[i + 1] || null;
      if (value === '/') {
        hasRecPos = true;
        continue;
      }
      // hasRecPos == false 尝试识别位置 (position)
      if (!hasRecPos) {
        if (numValReg.test(value)) {
          ret['background-position-x'] = value;
          ret['background-position-y'] = '50%';
          if (numValReg.test(nextValue)) {
            ret['background-position-y'] = nextValue;
            i++;
          }
          continue;
        }
      }
      // hasRecPos == true 尝试识别大小 (size)
      else {
        if (sizeTpReg.test(value)) {
          ret['background-size-width'] = 
          ret['background-size-height'] = value;
        }
        else if (numValReg.test(value)) {
          ret['background-size-width'] = value;
          ret['background-size-height'] = 'auto';
          if (numValReg.test(nextValue)) {
            ret['background-size-height'] = nextValue;
            i++;
          }
          continue;
        }
      }
      // hasRecOri == false 尝试识别Origin
      if (!hasRecOri) {
        if (boxModReg.test(value)) {
          ret['background-origin'] = value;
          hasRecOri = true;
          continue;
        }
      } else {
        if (boxModReg.test(value)) {
          ret['background-clip'] = value;
          continue;
        }
      } // END-OF-IF
    } // END-OF-FOR
    return ret;
  } // END-OF-FUN(postRecognizeProperty)

  /**
   * 整理属性值（background-position属性）
   * - 缺失值补充
   * - 乱序值排序
   * @param {Array} valueArray 
   */
  function arrangeValues(valueArray) {
    let keyReg = /left|right|center|.*(%|em|px)/;
    let keyPos = valueArray.findIndex(function(value) {
      return (value === 'top' || value === 'bottom');
    });
    // 找到top、bottom值
    if (keyPos !== -1) {
      let preValue = valueArray[keyPos - 1] || null,
          nextValue = valueArray[keyPos + 1] || null;
      // 后面有值 -> 交换位置
      if (keyReg.test(nextValue)) {
        [valueArray[keyPos], valueArray[keyPos + 1]] = [valueArray[keyPos + 1], valueArray[keyPos]];
      }
      // 前面无值 -> 补充参数
      else if (!keyReg.test(preValue)) {
        valueArray.splice(keyPos, 0, '50%');
      }
    }
    return valueArray;
  }
  /**
   * 替换属性值为数值
   * @param {Array} valueArray 
   */
  function replaceValues(valueArray) {
    for (let i = 0; i < valueArray.length; i++) {
      switch(valueArray[i]) {
        case 'top':
        case 'left':
          valueArray[i] = '0%';
          break;
        case 'center':
          valueArray[i] = '50%';
          break;
        case 'bottom':
        case 'right':
          valueArray[i] = '100%';
          break;
        default: 
          break;
      } // END-OF-SWITCH
    } // END-OF-FOR
    return valueArray;
  } // END-OF-FUNC(replaceValues)

  /**
   * 属性补全
   * @param {Array} valueArray 
   */
  function complementValues(longhandProperties) {
    for (let key in backgoundDefault) {
      if (! (key in longhandProperties)) {
        longhandProperties[key] = backgoundDefault[key];
      }
    }
    return longhandProperties;
  }

  return plugin;
};