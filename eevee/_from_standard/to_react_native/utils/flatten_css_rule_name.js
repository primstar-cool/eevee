module.exports = function flattenCssRuleName(v) {
    return v.route.map(
        v2 => typeof v2 === 'string' ? v2 : (v2.tag ? ["tag-" + v2.tag]:[]).concat(v2.classList || []).concat((v2.id ? ["ID-" + v2.id]:[])).join("_x_")
    ).join("").replace(/>/g, "_7_").replace(/[ ]/g, "_0_");
}