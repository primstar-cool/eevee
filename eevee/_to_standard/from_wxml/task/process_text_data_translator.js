


module.exports = function (node) {

    processTextDataTranslator(node);

    function processTextDataTranslator(node) {

        if (node.data) {
            // debugger
            if (node.data.includes("\\")) {
                // debugger

                let converedStr = '';
                let str = node.data;
                let lastProcessedIndex = 0;
                let rawStr = node.data;
                let isInString = null;
                let isInBrace = 0;
                
                let braceL = '{'.charCodeAt(0);
                let braceR = '}'.charCodeAt(0);
                let string1 = `'`.charCodeAt(0);
                let string2 = `"`.charCodeAt(0);
                let slash =  `\\`.charCodeAt(0);
                
                for (let i = 0; i < rawStr.length; i++) {
                    let c = rawStr.charCodeAt(i);

                    if (isInBrace) {
                        if (isInString) {
                            if (c === slash) {
                                i++; //skip  {{"\""}}
                            } else if (c === isInString) {
                                isInString = null; 
                            }
                        } else { //skip {{ "}}" }}

                            if (c === braceL) { // {{ {a:1m b: {}}}}
                                isInBrace++;
                            } else if (c === braceR) {
                                isInBrace--; 
                            } else if (c === string1 || c === string2) {
                                isInString = c;
                            }
                        }
                    } else {
                        if (c === braceL && (i < rawStr.length && rawStr.charCodeAt(i+1) === braceL)) {
                            isInBrace = true;
                        } else if (c === slash) {
                            if (i < rawStr.length) {
                                c = rawStr[i+1];

                                converedStr += rawStr.substring(lastProcessedIndex, i) + eval(`"\\${c}"`);
                                lastProcessedIndex = i+2;
                                i++;
                            }
                        }
                    }

                }

                if (lastProcessedIndex !== rawStr.length) {
                    converedStr += rawStr.substring(lastProcessedIndex);
                } else {
                    // debugger
                }

                node.data = converedStr;


            }
        }


        if (!node.childNodes) return;
        for (var i = 0; i < node.childNodes.length; i++) {
            var subNode = node.childNodes[i];
            node.childNodes.forEach(
                subNode => {
                    processTextDataTranslator(subNode);
                }
            );

        }


        
    }
}