module.exports = parseXML

function __debug_ASSERT(flag, ...args) {
  if (!flag) {
    console.log.apply(console, args);
    console.error.apply(console, args);
    
    throw new Error(Array.prototype.slice.call(args).join('\t'));
  }
}

function parseXML(xmlString) {
  const ST = {
    FIND_TAG: 1,
    FIND_TAG_NAME: 2,
    DUMP_TAG_ATTR_L: 3,
    DUMP_TAG_ATTR_R: 4,
  };

  // if (xmlString.startsWith('<wxs')) debugger

  const lk = '{'.charCodeAt(0);
  const rk = '}'.charCodeAt(0);
  const lt = '<'.charCodeAt(0);
  const gt = '>'.charCodeAt(0);
  const sl = '/'.charCodeAt(0);
  const bsl = '\\'.charCodeAt(0);

  const spc = ' '.charCodeAt(0);
  const eq = '='.charCodeAt(0);

  const ss = "'".charCodeAt(0);
  const sd = '"'.charCodeAt(0);
  const tab = '\t'.charCodeAt(0);
  const enter = '\n'.charCodeAt(0);
  const newline = '\r'.charCodeAt(0);

  // xmlString = xmlString.trim();
  // xmlString = xmlString.replace(/\t/g, ' '); // 会影响pre标签里的 table, 不过不管了
  // xmlString = xmlString.replace(/\r\n/g, '\n'); // 会影响pre标签里的 \r, 不过不管了
  // xmlString = xmlString.replace(/<--/g, ' '); // 会影响pre标签里的,  不过不管了

  var rootNode = {
    tagName: null,
    attrs: {},
    childNodes: [],
    data: null,
  };

  var lastNode = rootNode;

  var state = ST.FIND_TAG;
  var textNodeStartIndex = null;
  var tagNameStartIndex = null;
  var attrKeyStartIndex = null;
  var attrValueStartIndex = null;

  var curAttrName = null;
  var curAttrStringIdentity = null;
  var isInExpression = 0;
  var isInString = 0;

  for (var i = 0; i < xmlString.length; i++) {
    var c = xmlString.charCodeAt(i);

    // if (i == 280) {
    //   debugger;
    // }
    //
    // if (i >= 280) {
    //   console.log(String.fromCharCode(c));
    // }


    // if (xmlString.startsWith('<wxs')) {
    //   console.log(String.fromCharCode(c));
    // }

    switch (state) {
      case ST.FIND_TAG:

        var bIsFindNewTag  = (c === lt && !isInExpression);

        if (bIsFindNewTag && isScriptNodeOrWithSpecChar(lastNode)) { //
          bIsFindNewTag = xmlString.charCodeAt(i+1) === sl;
          // debugger
        }

        if (bIsFindNewTag) {
          __debug_ASSERT(lastNode, 'missing lastNode');

          if (isHtmlNoTagEndEnableNode(lastNode)) {
            lastNode = lastNode.parentNode;
          }

          if (textNodeStartIndex !== null) {
            var textNode = {
              tagName: null,
              attrs: {},
              childNodes: null,
              data: xmlString.substring(textNodeStartIndex, i),
              // parentNode: lastNode,
            };
            Object.defineProperty(
              textNode, "parentNode", {value: lastNode, enumerable: false, writable: true}
            );

            lastNode.childNodes.push(textNode);
            textNodeStartIndex = null;
          }

          tagNameStartIndex = i + 1;
          state = ST.FIND_TAG_NAME;
        } else {
          if (textNodeStartIndex === null) {
            textNodeStartIndex = i;
          }

          if (c === lk && xmlString.charCodeAt(i + 1) === lk) {
            isInExpression = 1;
          } else if (isInExpression) {
            
            if (!isInString) {
              if (c === rk &&
                xmlString.charCodeAt(i - 1) === rk
              ) {
                isInExpression = 0;
              }

              if (c === ss || c === sd) {
                isInString = c;
              }
            } else {
              if (c === bsl) {
                i++;
                continue;
              }

              if (c === isInString) {
                isInString = 0;
              }
            }
                        
          }
        }
        break;
      case ST.FIND_TAG_NAME:
        if (isWhiteChar(c) || c === gt) {
          __debug_ASSERT(tagNameStartIndex !== null && lastNode);

          if (tagNameStartIndex) {
            var tagName = xmlString.substring(tagNameStartIndex, i).trim();

            if (!tagName) {
              tagNameStartIndex++;
              continue;
            }

            if (tagName.charCodeAt(0) === sl) {
              if (isWhiteChar(c)) {
                /**
                 * `<view></view >`
                 *              ^
                 */
                continue;
              }
              __debug_ASSERT(lastNode.tagName === tagName.substr(1), 'unpair tagname:' , lastNode.tagName , tagName.substr(1));

              // 闭合标签
              __debug_ASSERT(lastNode.parentNode);
              lastNode = lastNode.parentNode;
              // __debug_ASSERT(lastNode);
              state = ST.FIND_TAG;

              // do {
              //   c = xmlString.charCodeAt(++i);
              // } while (c !== gt);

              textNodeStartIndex = null;
            } else if (tagName.indexOf('!--') === 0) {
              var r = xmlString.substring(i);

              if (
                c === gt &&
                tagName.lastIndexOf('--') === tagName.length - 2
              ) {
                commentNode = {
                  tagName: null,
                  attrs: {},
                  childNodes: null,
                  data: '<' + tagName + '>',
                  // parentNode: lastNode,
                };
                Object.defineProperty(
                  commentNode, "parentNode", {value: lastNode, enumerable: false, writable: true}
                );

                lastNode.childNodes.push(commentNode);
                state = ST.FIND_TAG;
                textNodeStartIndex = null;
              } else {
                var endIndex = r.indexOf('-->');

                var commentNode = {
                  tagName: null,
                  attrs: {},
                  childNodes: null,
                  data: xmlString.substring(
                    tagNameStartIndex - 1,
                    i + endIndex + 3
                  ),
                  // parentNode: lastNode,
                };
                Object.defineProperty(
                  commentNode, "parentNode", {value: lastNode, enumerable: false, writable: true}
                );

                lastNode.childNodes.push(commentNode);
                i = i + endIndex + 2;

                state = ST.FIND_TAG;
                textNodeStartIndex = null;
              }
            } else {
              var tagNode = {
                tagName: tagName,
                attrs: {},
                childNodes: [],
                data: null,
                // parentNode: lastNode,
              };
              Object.defineProperty(
                tagNode, "parentNode", {value: lastNode, enumerable: false, writable: true}
              );

              lastNode.childNodes.push(tagNode);
              lastNode = tagNode;

              tagNameStartIndex = null;
              attrKeyStartIndex = i;

              if (c === gt) {
                // end of a tag
                state = ST.FIND_TAG;
              } else {
                state = ST.DUMP_TAG_ATTR_L;
              }
            }
          }
        }

        break;
      case ST.DUMP_TAG_ATTR_L:
        if (c === gt) {
          if (attrKeyStartIndex) {
            curAttrName = xmlString.substring(attrKeyStartIndex, i).trim();
            if (curAttrName) {
              setNoValueAttri();
            }
          }

          attrKeyStartIndex = null;
          state = ST.FIND_TAG;


        } else if (c === sl) {
          i++;
          c = xmlString.charCodeAt(i);

          __debug_ASSERT(c === gt);
          if (c === gt) {
            // 自闭标签
            lastNode = lastNode.parentNode;
            __debug_ASSERT(lastNode);
            attrKeyStartIndex = null;
            state = ST.FIND_TAG;
          }
        } else if (c === eq) {
          __debug_ASSERT(attrKeyStartIndex);
          if (attrKeyStartIndex) {
            curAttrName = xmlString.substring(attrKeyStartIndex, i).trim();
            attrKeyStartIndex = null;
          }

          do {
            c = xmlString.charCodeAt(++i);
          } while (isWhiteChar(c));

          if (c === ss || c === sd) {
            attrValueStartIndex = i;
            curAttrStringIdentity = c;
            state = ST.DUMP_TAG_ATTR_R;
          } else {
            setNoValueAttri();
            i--;
            attrKeyStartIndex = i;
          }
        } else if (isWhiteChar(c)) {
          if (attrKeyStartIndex) {
            curAttrName = xmlString.substring(attrKeyStartIndex, i).trim();

            if (curAttrName) {

              do {
                c = xmlString.charCodeAt(++i);
              } while (isWhiteChar(c));

              i--;
              
              if (c === eq) {
              } else {
                setNoValueAttri();
                attrKeyStartIndex = i;
              }
            } else {
              attrKeyStartIndex++;
            }
          }
        }

        break;
      case ST.DUMP_TAG_ATTR_R:
        if (c === bsl) {
          // 如果是斜杠, 跳过下个字符
          i++;
        } else if (c === curAttrStringIdentity) {
          // ' or ""

          // __debug_ASSERT(attrValueStartIndex);

          if (attrValueStartIndex) {
            var attrValue = xmlString.substring(attrValueStartIndex, i + 1);

            if (attrValue.charCodeAt(0) === sd) {
              lastNode.attrs[curAttrName] = JSON.parse(attrValue);
            } else {
              __debug_ASSERT(attrValue.charCodeAt(0) === ss);

              attrValue = attrValue.substring(1, attrValue.length - 1);

              var attrValue2 = '';

              for (var ai = 0; ai < attrValue.length; ai++) {
                var ac = attrValue.charAt(ai);

                if (ac === '\\') {
                  attrValue2 += ac;
                  attrValue2 += attrValue.charAt(++ai);
                } else if (ac === '"') {
                  attrValue2 += "'";
                } else {
                  attrValue2 += ac;
                }
              }

              lastNode.attrs[curAttrName] = JSON.parse('"' + attrValue2 + '"');
            }

            attrValueStartIndex = null;
            attrKeyStartIndex = i + 1;
            curAttrName = null;
          }

          state = ST.DUMP_TAG_ATTR_L;
        }
        break;
    }
  }

  if (textNodeStartIndex !== null) {
    var textNode = {
      tagName: null,
      attrs: {},
      childNodes: null,
      data: xmlString.substring(textNodeStartIndex, i),
      // parentNode: lastNode,
    };
    Object.defineProperty(
      textNode, "parentNode", {value: lastNode, enumerable: false, writable: true}
    );


    lastNode.childNodes.push(textNode);
    textNodeStartIndex = null;
  }

  return rootNode;

  function isWhiteChar(c) {
    return c === spc || c === tab || c === enter || c === newline;
  }

  function setNoValueAttri() {
    attrKeyStartIndex = null;
    lastNode.attrs[curAttrName] = true;
    curAttrName = null;
  }

  function isScriptNodeOrWithSpecChar(node) {
    return node.tagName === 'wxs' || node.tagName === 'script' || node.tagName === 'filter' || node.tagName === 'style'
  }

  function isHtmlNoTagEndEnableNode(node) {
    return node.tagName === 'img' || node.tagName === 'br' || node.tagName === 'hr';
  }
}