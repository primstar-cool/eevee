const rollup = require('rollup');
const fileContent = new TextDecoder().decode(base64Decode(process.argv[2]));




debugger

const inputOptions = {
  input: 'virtual-entry.js',
  treeshake: process.argv[3] || true, // 摇树优化
  plugins: [
    {
      resolveId(id) {
        if (id === 'virtual-entry.js') {
          return id;
        }
      },
      load(id) {
        if (id === 'virtual-entry.js') {
          return fileContent;
          ;
        }
      }
    },
  ]
}

rollup.rollup(inputOptions).then(
  (bundle) => {
    bundle.generate({
      format: 'es'
    }).then(
      (result) => {
        console.log("succ: " +  result.output[0].code);
      }
    )
  },
  (err) => {
    console.log("err: " + err)
  }
);


function base64Decode(data) {

  var dataBuffer_1;
  var dataBuffer_2;
  var dataBuffer_3;

  //alert("=".charCodeAt(0)); 61

  var stringLength = data.length;
  var outputLength = (stringLength * 3) / 4;
  if (data.charCodeAt(data.length - 2) == 61) //=
    outputLength -= 2;
  else if (data.charCodeAt(data.length - 1) == 61)
    outputLength -= 1;

  var outputArrayBuffer = new ArrayBuffer(outputLength);
  var output = new Uint8Array(outputArrayBuffer);
  var BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var outputPt = 0;


  //alert("=".charCodeAt(0)); //61
  for (var i = 0; i < stringLength; i += 4) {

    dataBuffer_1 = BASE64_CHARS.indexOf(data.charAt((i + 1)));
    dataBuffer_2 = BASE64_CHARS.indexOf(data.charAt((i + 2)));
    dataBuffer_3 = BASE64_CHARS.indexOf(data.charAt((i + 3)));

    // var _u8d;

    output[outputPt++] = ((BASE64_CHARS.indexOf(data.charAt((i))) << 2) + ((dataBuffer_1 & 0x30) >> 4));
    //alert("outputPt" + (outputPt-1) + ":" + output[outputPt-1]);
    if (outputPt < outputLength)
      output[outputPt++] = (((dataBuffer_1 & 0x0f) << 4) + ((dataBuffer_2 & 0x3c) >> 2));

    if (outputPt < outputLength)
      output[outputPt++] = (((dataBuffer_2 & 0x03) << 6) + dataBuffer_3);
  }

  //alert(output[0].toString(16));
  //alert(output[output.length - 1].toString(16));
  //alert(output.length);
  return outputArrayBuffer;
}