const path = require("path");
const fs = require("fs");

module.exports = function (parsedNodeImported, filePath, sourceType, targetEnv, findImportFn, config = {
    inlineImport: undefined, splitImportant: undefined
}, extraPlugin = null ) {
    // const injectComponentCSS = require('./plugins/inject_component_css.js');

    require("./plugins/remove_envif.js")(parsedNodeImported, targetEnv);
    

    if (config.inlineImport === undefined && targetEnv === 'BROWSER') {
        config.inlineImport = true;
    } 

    if (config.inlineImport)
        require("./plugins/inline_import.js")(parsedNodeImported, filePath, findImportFn, targetEnv);

    if (config.splitImportant) 
        require("./plugins/split_important.js")(parsedNodeImported);

    let plugins = [
        // injectComponentCSS({ from, componentWXSSPaths, readFile }),
        //读取 import 的文件，写入 page.css
        // 先引入，再替换
        // (sourceType === "wxmp") ? require('./plugins/replace_selectors_browser.js')() : null,

        // findImportFn
        targetEnv === 'BROWSER' && (sourceType !== "vue" && sourceType !== "react") && require('./plugins/replace_selectors_browser.js')(),
        targetEnv === 'WXMP' && (sourceType === "vue" || sourceType === "react") && require('./plugins/replace_selectors_mp.js')(),

        targetEnv === 'BROWSER' && (sourceType === "wxmp" || sourceType === "ttma" || sourceType === "ksmp" || sourceType === "swan") && require('./plugins/rpx_to_rem.js')(),
        targetEnv === 'WXMP' && (sourceType === "vue" || sourceType === "react") && require('./plugins/rem_to_rpx.js')(7.5),
        
        // retainComment ? null : require('./plugins/remove_comment.js')(),
    ];

    if (extraPlugin) {
        plugins = plugins.concat(extraPlugin);
    }
    
    
    plugins.forEach((plugin) => {
        if (plugin)
            plugin(parsedNodeImported);
    });

    
}