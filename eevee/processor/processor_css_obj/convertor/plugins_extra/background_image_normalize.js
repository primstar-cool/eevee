const traverse = require('../utils/traverse.js');
const colorNormalize = require('../utils/color_normalize.js');


function handleAngle(value) {
  let angle = Number(value.replace('deg', '').trim());

  angle = angle % 360;
  angle < 0 && (angle += 360);

  return angle;
}

function checkSideCorner(value) {
  let valueArr = value.trim().split(' ');
  switch (valueArr.length) {
    case 2:
      let direction = valueArr[1];
      if(direction !== 'top' && direction !== 'bottom' && direction !== 'left' && direction !== 'right') {
        value = null;
      } 
      break;
    case 3:
      let v = valueArr[1];
      let h = valueArr[2];

      if((v !== 'top' && v !== 'bottom') || (h !== 'left' && h !== 'right')) {
        value = null;
      } 
      
    default:
      value = null;
      break;
  }

  value = valueArr.join(' ');

  switch (value) {
    case 'to top':
      value = 0;
      break;
    case 'to top right':
      value = 45;
      break
    case 'to right':
      value = 90;
      break
    case 'to bottom right':
      value = 135;
      break
    case 'to bottom':
      value = 180;
      break
    case 'to bottom left':
      value = 225;
      break
    case 'to left':
      value = 270;
      break
    case 'to top left':
      value = 315;
      break
    default:
      value = null
      break;
  }

  return value;
}

function handleColor(value) {
  value = value.trim();

  if(value.indexOf('rgb') === 0) {
    value = value.substring(0, value.indexOf(')') + 1)
  } else {
    value = value.split(' ')[0];
  }

  return colorNormalize(value);
}

/**
 * @desc 解析
 * @param {string} colorString 
 * @return {Array} color 
 */
function analyzeColors(colorString) {
  let colorQueue = [];
  let hexColorReg = /^#[0-9a-fA-F]{3,6}/;
  let funcColorReg = /^(rgb|rgba|hsl|hsla)\(.*?\)/;

  colorString = colorString.trim();
  
  // TODO
  while (hexColorReg.test(colorString) || funcColorReg.test(colorString)) {
    // #
    let reg = colorString.charCodeAt() === 35 ? hexColorReg : funcColorReg;
    let subColorString = colorString.match(reg)[0];
    let nextStartIndex = colorString.indexOf(',', subColorString.length);

    colorQueue.push(handleColor(subColorString));

    if(nextStartIndex === -1) {
      break
    } else {
      colorString = colorString.substring(nextStartIndex + 1, colorString.length).trim();
    }
  }

  return colorQueue;
}

module.exports = () => {
  return (root) => {
    traverse(root, (node) => {
      if( node.type === 'declaration' ) { 
        let key = node.property;
        let backgroundValue = node.value;

        if(key === 'background-image' && backgroundValue.indexOf('linear-gradient') !== -1) {
          let angleReg = /^-?\d{1,}(\.\d+)?deg$/;
          let sideCornerReg = /^to/;

          let valueString = backgroundValue.substring(16, backgroundValue.length - 1).trim();

          // let valueArr = valueString.split(',');
          // let minLen = 3;

          let direction = valueString.substring(0, valueString.indexOf(','));
          
          let colorString = valueString.substring(valueString.indexOf(',') + 1, valueString.length);
          let [startColor, endColor] = analyzeColors(colorString);

          if(direction) {
            angleReg.test(direction) && (direction = handleAngle(direction));
            sideCornerReg.test(direction) && (direction = checkSideCorner(direction))
          } else {
            direction = "to bottom";
            minLen = 2
          }

          if(!direction || !startColor || !endColor) {
            node.value = 'none';
            // console.ASSERT(false, "linear-gradient just can adjust a start color and an end color!");
          }

          node.value = `linear-gradient(${direction}deg, ${startColor}, ${endColor})`;
        }

        if(key === 'background-image' && backgroundValue.indexOf('url') !== -1) {

          backgroundValue = backgroundValue.substring(backgroundValue.indexOf("url") + 3).trim();
          backgroundValue = backgroundValue.substring(1, backgroundValue.length - 1).trim();
          if (backgroundValue.charAt(0) === `"` || backgroundValue.charAt(0) === `'`)
            backgroundValue = backgroundValue.substring(1, backgroundValue.length - 1);

          node.value = `url(${backgroundValue})`;
        }
      }
    });
  };
};