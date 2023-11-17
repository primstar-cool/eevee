function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}


const colorMapping = require("./color_mapping.js")

/**
 * 
 * @param {*} h: Hue, Accecpt A Number
 * @param {*} s: Saturation, Accept a percent or number  
 * @param {*} l: Lightness, Accept a percent or number
 * @param {*} a: Opacity, Accept a number
 * @desc transform HSL to RGB
 */
const transformHSLToRGB = (h, s, l) => {
  [h, s, l, a] = hslParamsNormalize(h, s, l);
  
  let r, g, b;
  let q, p;

  h = h / 360;

  // satuation is zero. then r, g, b all should equals lightness in value areas [0,1];
  if (s === 0) {
      r = g = b = l;
      return [r * 255, g * 255, b * 255]
  }

  if (l >= 0.5) {
      q = l + s - (l * s);
  } else {
      q = l * (1 + s);
  }

  p = 2 * l - q;

  r = h + 1 / 3;
  g = h;
  b = h - 1 / 3;

  return [r, g, b].map(c => {
      c > 1 && (c = c - 1);
      c < 0 && (c = c + 1);

      if (c < 1 / 6) {
          c = p + ((q - p) * 6 * c);
      } else if (c >= 1 / 6 && c < 1 / 2) {
          c = q;
      } else if (c >= 1 / 2 && c < 2 / 3) {
          c = p + ((q - p) * 6 * (2 / 3 - c));
      } else {
          c = p;
      }

      return Math.round(c * 255);
  })

  function hslParamsNormalize(h, s, l) {
    h = parseInt(h);
    s = String(s).indexOf('%') === -1 ? parseFloat(s) : parseFloat(s.trim().replace('%', '') / 100);
    l = String(l).indexOf('%') === -1 ? parseFloat(l) : parseFloat(l.trim().replace('%', '') / 100);
    
    if(isNaN(h) || isNaN(s) ||  isNaN(l)) {
      console.log(h, s, l);
      throw new Error('Error input')
    };
    

    if (h < 0) h = 0;
    else if (h > 360) h = 360;
    
    if (s < 0) s = 0;
    else if (s > 1) s = 1;


    if (l < 0) l = 0;
    else if (l > 1) l = 1;

    return [h, s, l];
  }
}

/**
 * @param {string} colorString 
 * @returns {string} picasso 接受的色值
 */
function colorNormalize (colorString, colorType="ARGB") {

  ASSERT(colorType === 'ARGB' || colorType === 'RGBA')

  var ret;
  if (colorString.indexOf("rgb") === 0) {
    colorString = colorString.substring(colorString.indexOf('(') + 1, colorString.lastIndexOf(")"));
    var colorArray = colorString.split(',').map(c => c.trim());

    var r = parseInt(colorArray[0]);
    if (r < 0) r = 0;
    else if (r > 0xff) r = 0xff;
    var g = parseInt(colorArray[1]);
    if (g < 0) g = 0;
    else if (g > 0xff) g = 0xff;
    var b = parseInt(colorArray[2]);
    if (b < 0) b = 0;
    else if (b > 0xff) b = 0xff;
    var a = colorArray[3] ? Math.round(parseFloat(colorArray[3]) * 0xFF) : 0xff;

    var rgb = "" +
      (r <= 0xF ? "0" : "") + r.toString(16) +
      (g <= 0xF ? "0" : "") + g.toString(16) +
      (b <= 0xF ? "0" : "") + b.toString(16);

    if (colorArray.length === 3)
      ret = "#" + rgb;
    else {
      if (colorType === 'ARGB')
        ret = "#" + (a <= 0xF ? "0" : "") + a.toString(16) + rgb;
      else if (colorType === 'RGBA') {
        ret = "#" + rgb + (a <= 0xF ? "0" : "") + a.toString(16);
      } 
    }

  } else if (colorString.indexOf("hsl") === 0) {

    colorString = colorString.substring(colorString.indexOf('(') + 1, colorString.lastIndexOf(")"));
    let colorArray = colorString.split(',').map(c => c.trim());

    let [r, g, b, ] = transformHSLToRGB(colorArray[0], colorArray[1], colorArray[2]);
    let a = colorArray[3] ? Math.round(parseFloat(colorArray[3]) * 0xFF) : 0xff;

    ret = "" +
      (r <= 0xF ? "0" : "") + r.toString(16) +
      (g <= 0xF ? "0" : "") + g.toString(16) +
      (b <= 0xF ? "0" : "") + b.toString(16);

    if (colorArray.length === 3)
      ret = "#" + ret;
    else {
      if (colorType === 'ARGB')
        ret = "#" + (a <= 0xF ? "0" : "") + a.toString(16) + ret;
      else if (colorType === 'RGBA') {
        ret = "#" + ret + (a <= 0xF ? "0" : "") + a.toString(16);
      } 
    }
  } else if (colorMapping[colorString]) {
    ret = colorMapping[colorString];
  } else if (colorString.length === 4) { //#ccc
    ret = '#' + colorString[1] + colorString[1] + colorString[2] + colorString[2] + colorString[3] + colorString[3];
  } else {
    ret = colorString; //red transparent etc.
  }


  return ret
}

module.exports = colorNormalize;