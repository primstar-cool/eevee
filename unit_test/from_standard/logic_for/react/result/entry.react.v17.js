function entry (_cONTEXT, _mETHODS, _jsxRuntime) {
  return (0, _jsxRuntime.jsx)("div", {children: [
      (0, _jsxRuntime.jsx)('div', {
        "className": "rn-view", 
        children: [
          (_cONTEXT.loopData).map((item, idx) => (
              (0, _jsxRuntime.jsx)('text', {
                children: ((((("id:" + idx) + ", name:") + item.name) + ", pt: ") + item.point)} )
            )
          ),
          (_cONTEXT.loopData).map((item2) => (
              (0, _jsxRuntime.jsx)('div', {
                "className": "rn-view", 
                children: [
                  (0, _jsxRuntime.jsx)('text', {
                    children: item2.name} )
              ]} )
            )
          ),
          (_cONTEXT.loopData).map(() => (
              (0, _jsxRuntime.jsx)('text', {
                children: "empty"} )
            )
          ),
          (_cONTEXT.loopData).map((item3) => (
              (0, _jsxRuntime.jsx)('text', {
                children: "nouse"} )
            )
          )
      ]} ),
  ]});

/*FOR_FUNC_DEFINE*/
// _for_map_fn_0 was ready inlined
// _for_map_fn_1 was ready inlined
// _for_map_fn_2 was ready inlined
// _for_map_fn_3 was ready inlined
}
