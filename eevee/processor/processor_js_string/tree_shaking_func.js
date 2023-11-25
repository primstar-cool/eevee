const { execSync } = require('child_process') 

module.exports = function treeShakingFunc(
    fileContent,
    filename,
    treeshakingPreset = 'recommended'//type TreeshakingPreset = 'smallest' | 'safest' | 'recommended';

  ) {
    // const inputOptions = {
    //     input: 'index.js',
    //     plugins: [
    //     //   nodeResolve(),
    //     //   terser()
    //     ]
    //   };
    const options = {env:{}};


    // window trace " diffrect with mac os
    // so use base64 not JSON.stringify

    let cmd = `node ${require("path").join(__dirname, "tree_shaking_exec.js").replace(/\\/g, "/")} "${base64Encode(fileContent)}" ${JSON.stringify(treeshakingPreset)}`;
    let result = execSync(
      cmd,
      options
    ).toString();
    
    if (result.startsWith("succ: ")) {
      return result.substr(6);
    }
    else {
      console.error(result);
      return null;
    }
  };

  
function base64Encode(str) {
  // debugger
  const base64Dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("");

  const textEncode = new TextEncoder();
  data = textEncode.encode(str);

  if (!data.byteLength) return "";

  var uint8Array = new Uint8Array(data);
  var mod = uint8Array.length % 3;
  var end = uint8Array.length - mod;
  var result = "";

  for (let i = 0; i < end; i+=3) {
    let char0 = uint8Array[i];
    let char1 = uint8Array[i+1];
    let char2 = uint8Array[i+2];

    result += base64Dict[char0 >>> 2];
    result += base64Dict[((char0 & 0x3) << 4) + (char1 >>> 4)];
    result += base64Dict[((char1 & 0xF) << 2) + (char2 >>> 6)];
    result += base64Dict[char2 & 0x3F];
  }

  if (mod === 1) {
    let char0 = uint8Array[end];
    result += base64Dict[char0 >>> 2];
    result += base64Dict[(char0 & 0x3) << 4];
    result += '=='
  } else if (mod === 2) {
    let char0 = uint8Array[end];
    let char1 = uint8Array[end+1];

    result += base64Dict[char0 >>> 2];
    result += base64Dict[((char0 & 0x3) << 4) + (char1 >>> 4)];
    result += base64Dict[((char1 & 0xF) << 2)];
    result += '='
  }

  return result;
}