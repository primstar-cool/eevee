module.exports = function (vueContent) {

    // console.log(vueContent)

    let template = null;
    
    if (vueContent.includes("<template>")) {
        template = vueContent.substring(
            vueContent.indexOf("<template>")  + 10,
            vueContent.indexOf("</template>"),
        ).trim();
    
        vueContent = vueContent.replace("<template>" + template + "</template>", "").trim();
    }
  

    let script = null;
    
    if (vueContent.includes("<script>")) {
        script = vueContent.substring(
            vueContent.indexOf("<script>") + 8,
            vueContent.indexOf("</script>"),
        ).trim();
        vueContent = vueContent.replace("<script>" + script + "</script>", "").trim();
    }

    // console.log(vueContent)


    let remainNodes = require("./parse_xml.js")(vueContent);
    let style;

    if (remainNodes.childNodes) {
        for (var i = 0; i < remainNodes.childNodes.length;i++) {
            var cNode = remainNodes.childNodes[i];
            if (cNode.tagName === "style") {
                style = cNode;
                break;
            }
        }
    }

    // console.log("template:\n" + template)
    // console.log("script:\n" + script)
    // console.log(style);

    return {template, script, style};
    
    

}