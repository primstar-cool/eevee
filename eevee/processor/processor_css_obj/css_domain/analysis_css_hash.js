function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
module.exports = function _analysisCssHash(cssHash) {
    //必须cssHash tag#id.class1.class2 或 tag.class1.class2#id
        

    // console.ASSERT(cssHash.charAt(0) === '@' , "hash should normalized by getNodeStyleHash");

    var hashIdxPlus1 = cssHash.indexOf('#') + 1;
    var dotIdxPlus1 = cssHash.indexOf('.') + 1;
    var classList, id, tag;
    
    if (!hashIdxPlus1 && !dotIdxPlus1) { // tag
        tag = cssHash;
    } else {
        if (!hashIdxPlus1) { // tag.class1.class2
            classList = cssHash.substring(dotIdxPlus1).split(".");
            tag = cssHash.substring(0, dotIdxPlus1 - 1);
        } else if (!dotIdxPlus1) { // tag#id
            id = cssHash.substring(hashIdxPlus1);
            tag = cssHash.substring(0, hashIdxPlus1 - 1);

        } else {
            if (hashIdxPlus1 < dotIdxPlus1) { // tag#id.class1.class2
                id = cssHash.substring(hashIdxPlus1, dotIdxPlus1-1);
                classList = cssHash.substring(dotIdxPlus1).split(".");
                tag = cssHash.substring(0, hashIdxPlus1 - 1);
            } else { // tag.class1.class2#id
                id = cssHash.substring(hashIdxPlus1);
                classList = cssHash.substring(dotIdxPlus1, hashIdxPlus1-1).split(".");
                tag = cssHash.substring(0, dotIdxPlus1 - 1);
            }
        }
    }


    var ret = {};

    if (tag) ret.tag = tag;
    if (id) ret.id = id;
    if (classList) ret.classList = classList;

    ASSERT(tag || id || classList, "WTF?!!");
    return ret;
}