module.exports = inline_import;

function inline_import(contentObject, filePath, findImportFn, targetEnv) {

    // debugger
    if (contentObject.stylesheet.rules) {

        let rules = contentObject.stylesheet.rules;
        for (let i = 0; i < rules.length; i++) {
            let r = rules[i];
            if (r.type === 'import') {
                let url = eval(r.import);
                if (findImportFn) {
                    let importedStyle = findImportFn(contentObject, r, filePath, url);
                    require("./remove_envif.js")(importedStyle.styleContent, targetEnv);
                    inline_import(importedStyle.styleContent, importedStyle.filePath, importedStyle.findImportFn || findImportFn);

                    r.type = 'comment';
                    r.comment = "expand import content from " + r.import + ' by ' + JSON.stringify(filePath);

                    rules.splice(
                        i+1, 0, ...importedStyle.styleContent.stylesheet.rules
                    );

                    i += importedStyle.styleContent.stylesheet.rules.length;
                }
                // _onFindAImport(eval(r.import));
            }
        }
      }
}

