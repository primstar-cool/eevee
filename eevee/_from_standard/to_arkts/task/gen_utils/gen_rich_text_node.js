
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const genIndent = require("../../../../exporter/string_utils/gen_indent.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
const getInheritStyle = require("../../../helpers/get_inherit_style.js");
const createMappedFunction = require("../../../../processor/processor_xml_obj/create_mapped_function.js");

function ASSERT (flag, ...args) {
  if (!flag) {
      debugger
      throw new Error(...args);
  }
}

module.exports = function genRichTextNode(nodeInfos, functionArray) {

      // debugger

      let richTextNode = {
          tagName: 'rich-text',
          _convertedTagName: "RichText",
          computedStyle: {
              display: "inline"
          },
          logic: {
              uuid: typeof nodeInfos[0].node.logic.uuid === 'string' ? nodeInfos[0].node.logic.uuid + "::rich-text" :
                (
                  (nodeInfos[0].node.logic.uuid.type === 'Literal') ? nodeInfos[0].node.logic.uuid.value + "::rich-text" :
                    {
                      type: "BinaryExpression",
                      left: nodeInfos[0].node.logic.uuid,
                      operator: '+',
                      right: {
                        type: 'Literal',
                        value: "::rich-text"
                      }
                    }
                )
            },
        }



        let retStr = `RichText(\n${genIndent(1)}/*`;

        retStr += nodeInfos.map(v=>v.str.trim()).join(`\n${genIndent(1)}`).replace(/\*\//g, "@/");

        retStr += `\n${genIndent(1)}*/\n`


        for (let i = 0; i < nodeInfos.length; i++) {
          let node = nodeInfos[i].node;
          let text = node.childNodes ? node.childNodes[0].data : node.data; 
          
          ASSERT(text||text==="", "?")



          retStr += `\n${genIndent(1)} `

          let style = `style="`;
          let color = node.computedStyle.color || getInheritStyle(node, "color");
          let fontWeight = node.computedStyle.fontWeight || getInheritStyle(node, "fontWeight");
          let fontSize = node.computedStyle.fontSize || getInheritStyle(node, "fontSize");
          let lineHeight = node.computedStyle.lineHeight || getInheritStyle(node, "lineHeight");

          if (color) {
            style += `color:${color};`
          }
          if (fontWeight) {
            style += `font-weight:${fontWeight};`
          }
          if (lineHeight) {
            if (typeof lineHeight === 'object') {

              lineHeight = createMappedFunction.createFunctionReturnStr(lineHeight);
              if (lineHeight.includes( `"lpx"`)) {
                if (lineHeight.includes( `+ "lpx"`))
                  style += "line-height:${px2vp(lpx2px((parseFloat(" + lineHeight.replace( `+ "lpx"`, '') + "))))}px;"
                else
                  style += "line-height:${px2vp(lpx2px((parseFloat(" + lineHeight + ").slice(0, -3))))}px;"
              } else if (lineHeight.includes( `"px"`))
                if (lineHeight.includes( `+ "px"`))
                    style += "line-height:${px2vp((parseFloat(" + lineHeight.replace( `+ "px"`, '') + ")))}px;"
                  else
                    style += "line-height:${px2vp(parseFloat((" + lineHeight + ").slice(0, -2))))}px;"
              else
                ASSERT(false);

            } else {

              if (lineHeight.endsWith("lpx"))
                style += "line-height:${px2vp(lpx2px(" + lineHeight.slice(0, -3) + "))};";
              else if (lineHeight.endsWith("px"))
                style += "line-height:${px2vp(" + lineHeight.slice(0, -2) + ")};";
              else 
                ASSERT(false);
            }
          }

          if (fontSize) {
            if (typeof fontSize === 'object') {

              fontSize = createMappedFunction.createFunctionReturnStr(fontSize);
              if (fontSize.includes( `"lpx"`)) {
                if (fontSize.includes( `+ "lpx"`))
                  style += "font-size:${px2vp(lpx2px((parseFloat(" + fontSize.replace( `+ "lpx"`, '') + "))))}px;"
                else
                  style += "font-size:${px2vp(lpx2px((parseFloat(" + fontSize + ").slice(0, -3))))}px;"
              } else if (fontSize.includes( `"px"`))
                if (fontSize.includes( `+ "px"`))
                    style += "font-size:${px2vp((parseFloat(" + fontSize.replace( `+ "px"`, '') + ")))}px;"
                  else
                    style += "font-size:${px2vp(parseFloat((" + fontSize + ").slice(0, -2))))}px;"
              else
                ASSERT(false);

            } else {

              if (fontSize.endsWith("lpx"))
                style += "font-size:${px2vp(lpx2px(" + fontSize.slice(0, -3) + "))};";
              else if (fontSize.endsWith("px"))
                style += "font-size:${px2vp(" + fontSize.slice(0, -2) + ")};";
              else 
                ASSERT(false);
            }
            

          }
          style += "\""

        
          if (typeof text === 'string') {
            retStr += "`<span " + style + ">" + text.replace(/[\n]/g, "<br>") + "</span>`"
          } else {
            retStr += "`<span " + style +">${" + getObjectDataExpression(text, functionArray) + ".replace(/\\\\n/g, '<br>')}</span>`"
          } 

          if (i !== nodeInfos.length - 1) {
            retStr += ' + ';
          }
        }

        // debugger

        const uuidString = getObjectDataExpression(richTextNode.logic.uuid, functionArray);
        if (uuidString[0] === "\"") {
          retStr += '\n' + genIndent(1) + '/*uuid=' + uuidString + "*/\n).backgroundColor(Color.Transparent)\n";
          richTextNode._uuid = uuidString;
        } else {
          retStr += '\n' + genIndent(1) + '/*uuid={' + uuidString.trim() + '}*/\n).backgroundColor(Color.Transparent)\n';
          richTextNode._uuid = uuidString;
        }

        return {node: richTextNode, str: retStr}
  
        
  }


//   function colorOverlay(coverColor, bgColor) {
//     coverColor = coverColor.trim();
//     bgColor = bgColor.trim();
//     if(coverColor.length === 9 && coverColor.charCodeAt(0) === 35) {
//         // 叠加底色
//         let [rc, gc, bc, ac] = hex2rgba(coverColor);
//         let [rb, gb, bb, ab] = hex2rgba(bgColor);

//         ac = ac / 255;
//         ab = ab / 255;

//         if(ab === 0) {
//             return coverColor
//         }

//         let r = Math.floor(rc * ac + rb * (1 - ac) * ab);
//         let g = Math.floor(gc * ac + gb * (1 - ac) * ab);
//         let b = Math.floor(bc * ac + bb * (1 - ac) * ab);

//         let a =  Math.floor((ac + (1 - ac) * ab) * 255);

//         let rgb = '' +
//             (r <= 0xF ? '0' : '') + r.toString(16) +
//             (g <= 0xF ? '0' : '') + g.toString(16) +
//             (b <= 0xF ? '0' : '') + b.toString(16);
//         let ret = '#' + (a <= 0xF ? '0' : '') + a.toString(16) + rgb;
//         return ret
//     } else {
//         return coverColor;
//     }

//     function hex2rgba(hex) {
//         console.ASSERT(hex.charCodeAt() === 35, 'Error import');
//         let a = parseInt(hex.substring(1, 3), 16);
//         let r = parseInt(hex.substring(3, 5), 16);
//         let g = parseInt(hex.substring(5, 7), 16);
//         let b = parseInt(hex.substring(7, 9), 16);

//         return [r, g, b, a];
//     }
// }