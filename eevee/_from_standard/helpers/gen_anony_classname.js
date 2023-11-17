module.exports = function (str) {
    let hash = 87453144; // just a magic number
    for (let i  = 0; i < str.length; i++) {
        let newChar =  str.charCodeAt(i);
        hash = hash * (newChar&0xFF) + (newChar >>> 16);
        hash = hash % 0x7FFFFFFF;
    }    
    return "Anony_" + (hash + 0x7FFFFFFFF).toString(36).substr(-7).toUpperCase();
}
