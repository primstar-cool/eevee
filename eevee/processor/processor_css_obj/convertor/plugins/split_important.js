module.exports = inline_import;

function inline_import(contentObject, filePath, findImportFn, targetEnv) {

    // debugger
    if (contentObject.stylesheet.rules) {

        let rules = contentObject.stylesheet.rules;
        let newRules = [];
        for (let i = 0; i < rules.length; i++) {
            let r = rules[i];
            let newR;
            if (r.type === 'rule' && r.declarations) {
                for (let j = 0; j < r.declarations.length;) {

                    if (r.declarations[j].type !== 'declaration') {j++; continue};

                    // if (!r.declarations[j].value) debugger
                    if (r.declarations[j].value.endsWith("!important")) {
                       
                        if (!newR) {
                            newR = Object.assign({}, r, {declarations: []})
                            newRules.push(newR);
                        };
                        newR.declarations.push(r.declarations[j]);

                        r.declarations.splice(j, 1);
                        // debugger

                    } else {
                        j++;
                    }
                }
            }
            // debugger
        }

        contentObject.stylesheet.rules = contentObject.stylesheet.rules.concat(newRules);
      }
}

