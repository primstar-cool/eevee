const path = require('path');
const genIndent = require("../../../exporter/string_utils/gen_indent.js");
const javascript = require('../../../parser/parse_ast/javascript');

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function processContext(contextNode, templateNode, mainClassName, destFileDict) {
    

  let localVarFunc = contextNode.childNodes.filter(
    v => v.tagName === 'identifier' && v.scope.startsWith("@LOCAL_")
  );

  localVarFunc.forEach(
    v => {


      let listenerObj = localVarFunc.filter(
        vv => (vv.logic ? vv.logic.rks||[] : []).includes(v.scope + v.id)
      );

      if (listenerObj.length) {
        if (!v.logic) v.logic = {};
        v.logic.listener = listenerObj.map(vv=> (vv.scope + vv.id));
// debugger
      }

      // debugger
    }
  );

  let canComuterVar = localVarFunc.filter(
    v => {
      if (!v.scope.startsWith("@LOCAL__")) return false;
      if (!v.logic) return true;
      if (!v.logic.rks) return true;

      if (v.logic.rks.filter(key => key.startsWith("@LOCAL__")).length) return false;

      let referLocalFunc = v.logic.rks.filter(key => key.startsWith("@LOCAL_FUNC__"));

      if (!referLocalFunc.length) return true;

      let referLocalFuncNode = referLocalFunc.map( funcName => localVarFunc.find(v => v.scope+v.id === funcName ));

      // debugger
      if (referLocalFuncNode.filter(v => v.logic.listener.length > 1).length) return false;

      referLocalFuncNode.forEach(
        vv => ASSERT(vv.logic.listener.length === 1 && vv.logic.listener[0] === v.scope + v.id)
      )

      return true
    }
      
  );
  // debugger
  let canComuterVarName = canComuterVar.map(v=>v.id);
  let notComputeVar = localVarFunc.filter(v=> v.scope.startsWith("@LOCAL__") && !canComuterVar.includes(v));

  require("../../helpers/process_context_spec_scope.js")(
    templateNode, transLocal, transMember, null
  );

  function transMember(astObjLoop) {
    let name = astObjLoop.name.substr(9);
    // delete astObjLoop.name;
    astObjLoop.name = "$MEMBER_" + name;

  }

  function transLocal(astObjLoop) {
    let name = astObjLoop.name.substr(8);

    if (canComuterVarName.includes(name)) {
      delete astObjLoop.name;
      astObjLoop.type = 'CallExpression';
      let obj = canComuterVar.find(v=>v.id === name);

      let paramsKey = obj.logic ? obj.logic.rks||[] : [];
      astObjLoop.callee = 
      new javascript.astFactory.MemberExpression(
        new javascript.astFactory.Identifier("LOCAL_" + name),
        new javascript.astFactory.Identifier("getValue"),
        false,
      );

      let localParams =  paramsKey.filter(v=>v.startsWith("@CONTEXT__")).map(
        v => new javascript.astFactory.Identifier(v.substr(10))
      );
      let memberParams =  paramsKey.filter(v=>v.startsWith("@MEMBER__")).map(
        v => new javascript.astFactory.Identifier("$MEMBER_" +  v.substr(9))
      );
      
      astObjLoop.arguments = localParams.concat(memberParams);

      // debugger

    } else {
      // debugger
      ASSERT(notComputeVar.find(v=>v.id === name))

      astObjLoop.type = "MemberExpression"
      delete astObjLoop.name;

      astObjLoop.object = new javascript.astFactory.Identifier(
        "$LOCAL"
      );
      astObjLoop.property = new javascript.astFactory.Identifier(
        name
      );
      astObjLoop.computed = false;
     
      


    }
  }

  canComuterVar.reverse().forEach(

    v => {


      let code = v.code.replace(`export default function`, `function getValue`)
      .replace(`/*${v.id}*/`, "")
      //.replace(new RegExp(`return[\s]+\{[\s]*${v.id}[\s]*\}`), `return ${v.id}`)
      ;

      let paramsKey = v.logic ? v.logic.rks||[] : [];
      let memberParams =  paramsKey.filter(v=>v.startsWith("@MEMBER__")).map(
        v => v.substr(9)
      );
      let contextMember = paramsKey.filter(v=>v.startsWith("@CONTEXT__"))

      if (memberParams.length) {
        code = code.replace(")", `${contextMember.length? ", ": ""}${memberParams.map(v => "$MEMBER_" + v).join(", ")})`)
        code = code.replace(/@MEMBER\./g, "$MEMBER_");
      }
      
      const { transformSync } = require('@babel/core');
      let es2015Code = transformSync(code, {"presets":[require("babel-preset-es2015")]}).code;
      es2015Code = es2015Code.substring(es2015Code.indexOf("function "));
    // debugger

      let wxsNode = {
        tagName: 'wxs',
        attrs: {
          module: "LOCAL_" + v.id
        },
        childNodes: [
          {
            data: "\n" + genIndent(1) + `${es2015Code}\nmodule.exports = {getValue: getValue};`.replace(/\n/g, "\n"+genIndent(1))
          }
        ]
      }

      if (!templateNode.childNodes) templateNode.childNodes = [];
      templateNode.childNodes.unshift(
        wxsNode
      );

      Object.defineProperty(
        wxsNode, "parentNode", {value: templateNode, enumerable: false, writable: true}
      );
      
    }
  )
  // debugger


  console.log("trans to wxs: " + canComuterVar.map(v => v.id).join(", "));
  console.log("trans to local object: " + notComputeVar.map(v => v.id).join(", "))

  let scriptNode = contextNode.childNodes.find(
    v => v.tagName === 'script'
  );

  // debugger
  if (scriptNode && notComputeVar.length) {
    let code = scriptNode.childNodes[0].data;
    const returnIndex = code.lastIndexOf("return ");
    const returnCode = code.substring(returnIndex, code.indexOf(";", returnIndex));
  
    code = code.replace(returnCode, `return {${notComputeVar.map(v => v.id).join(", ")}}`)
    code = code.replace(/@MEMBER\./g, "____MEMBER___");
    // debugger
    let trimFuncStr = require("../../../processor/processor_js_string/tree_shaking_func.js")(code, null, "smallest");
    code = `function (` + trimFuncStr.substring(trimFuncStr.indexOf(`function virtualEntry (`)  + 23, trimFuncStr.indexOf(`export { virtualEntry` )).trim()
    code = code.replace(/____MEMBER___/g, "page._$_");

    // debugger
    // scriptNode.childNodes[0].data = code;

    let params = Array.from(new Set(notComputeVar.map(v=> (v.logic ? v.logic.rks||[] : [])).flat().filter(v => v.startsWith("@CONTEXT__")))).map(v=>(v.substr(10)));
    code = `function (` + params.map(v=> v.trim()).join(", ") + code.substr(code.indexOf(")"))
    
    destFileDict[`${mainClassName}.setData.inject.seg.js`] =
`function checkIfUpdateLocal(page, newData) {
  let _needMakeLocal = 0;
  const _referKeys = [${params.map(v=>JSON.stringify(v)).join(", ")}];
  const _updatedKeys = Object.keys(newData);

  for (let i = 0; i < _referKeys.length; i++) {
    if (_updatedKeys.indexOf(_referKeys[i]) !== -1) {
      _needMakeLocal = 1;
      break;
    }
  }

  if (_needMakeLocal) {
    page.setData({
      '$LOCAL': (${code.replace(/\n/g, "\n"+genIndent(4))})(
          ${params.map(v=> "page.data."+v.trim()).join(", ")}
        )
    })

  }
}
 
`

  }
  

  let memberVar = contextNode.childNodes.filter(
    v => v.tagName === 'identifier' && v.scope.startsWith("@MEMBER__")
  );


  if (memberVar.length) {
    destFileDict[`${mainClassName}.onLoad.inject.seg.js`] =
`function onLoadRedefine(page) {
${memberVar.map(v=>v.id).map(v=>
`
  page._$_${v} = page.${v};
  delete page.${v};

  Object.defineProperty(
    page, "${v}", {
      get () {return this._$_${v}},
      set (v) {this._$_${v} = v; this.setData({${"$MEMBER_" + v}: v})},
    }
  )
`
  ).join("\n\n")}

}`

  }
}