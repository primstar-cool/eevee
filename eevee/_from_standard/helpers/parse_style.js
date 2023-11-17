module.exports = function parseStyle(styleString) {

  let s = {};
  styleString.split(";").forEach(
    v => {
      v = v.trim();

      if (v) {
        let idx = v.indexOf(":");
        let kv = v.split(":");
        styleKey = v.substring(0, idx).replace(/-[\w\W]/g, (v) => v[1].toUpperCase());
        let value = v.substring(idx + 1);

        if (typeof value === 'string') {
          if (value.endsWith("rpx")) {
            value = parseFloat(value.substr(0, value.length - 3)) / 7.5 + 'vw';
          } else if (value.endsWith("rem")) {
            
          } else if (value.endsWith("px")) {
            // value = parseFloat(value.substr(0, value.length - 2));
          } 
        }

        s[styleKey] = value;

      }
    }
  );

  if (Object.keys(s).length) return s;

  return null;

}