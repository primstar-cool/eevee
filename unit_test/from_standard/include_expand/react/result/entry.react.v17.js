function entry (_cONTEXT, _mETHODS, _jsxRuntime) {
  return (0, _jsxRuntime.jsx)("div", {children: [
      (0, _jsxRuntime.jsxs)('span', {
        "className": "wxmp-text", 
        children: "include test"} ),
      (0, _jsxRuntime.jsx)('div', {
        children: [
          /*<!--expand include from folder/include_lv0.wxml-->*/
          (/*_if_0 = */(_cONTEXT.abc && _cONTEXT.bcd)) && (0, _jsxRuntime.jsx)('span', {
            "className": "wxmp-text", 
            children: "it is included wxml"} ),
          /*<!--expand include from folder/include_lv1.wxml-->*/
          (/*_if_1 = */_cONTEXT.abc) && (0, _jsxRuntime.jsx)('span', {
            "className": "wxmp-text", 
            children: "it is included wxml in a sub wxml"} ),
          /*<!--expand include from folder/include_abs.wxml-->*/
          (0, _jsxRuntime.jsxs)('span', {
            "className": "wxmp-text", 
            children: "it is included wxml by abs path"} )
      ]} ),
  ]});

  /*IF_VAR_DEFINE*/

  // var _if_0; // unused var
  // var _if_1; // unused var
}
