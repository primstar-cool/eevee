const rollup = require('rollup');
const fileContent = JSON.parse(process.argv[2]);

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
