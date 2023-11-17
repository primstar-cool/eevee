function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
module.exports = function _analysisCssHash(cssHash) {
    //必须cssHash tag.class1.class2#id
    // console.ASSERT(cssHash.charAt(0) === '@' , "hash should normalized by getNodeStyleHash");

    var hashIdx = cssHash.indexOf('#');
    if (hashIdx !== -1) {
        var id = cssHash.substring(hashIdx + 1);
        cssHash = cssHash.substring(0, hashIdx);
    } 

    var dotIdx = cssHash.indexOf('.');
    if (dotIdx !== -1) {
        var tag = cssHash.substring(0, dotIdx);
        var classList = cssHash.substring(dotIdx+ 1).split(".");
    } else {
        tag = cssHash;//.substring(1);
    }


    var ret = {};

    if (tag) ret.tag = tag;
    if (id) ret.id = id;
    if (classList) ret.classList = classList;

    ASSERT(tag || id || classList, "WTF?!!");
    return ret;
}