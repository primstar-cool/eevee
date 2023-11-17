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
    let cmd = `node ${require("path").join(__dirname, "tree_shaking_exec.js")} ${JSON.stringify(JSON.stringify(fileContent))} ${JSON.stringify(treeshakingPreset)}`;
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