function entry (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {
  return Rc("div", null, [
    Rc('div', {"className": "rn-view"}, [
      (_cONTEXT.loopData).map((item, idx) => (
          Rc('text', {}, ((((("id:" + idx) + ", name:") + item.name) + ", pt: ") + item.point))
        )
      ),
      (_cONTEXT.loopData).map((item2) => (
          Rc('div', {"className": "rn-view"}, [
            Rc('text', {}, item2.name)
          ])
        )
      ),
      (_cONTEXT.loopData).map(() => (
          Rc('text', {}, "empty")
        )
      ),
      (_cONTEXT.loopData).map((item3) => (
          Rc('text', {}, "nouse")
        )
      )
    ]),
  ]);

/*FOR_FUNC_DEFINE*/
// _for_map_fn_0 was ready inlined
// _for_map_fn_1 was ready inlined
// _for_map_fn_2 was ready inlined
// _for_map_fn_3 was ready inlined
}
