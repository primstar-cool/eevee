function entry (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {
  return Rc("div", null, [
    Rc('span', {"className": "wxmp-text"}, "include test"),
    Rc('div', {}, [
      /*<!--expand include from folder/include_lv0.wxml-->*/
      (/*_if_0 = */(_cONTEXT.abc && _cONTEXT.bcd)) && Rc('span', {"className": "wxmp-text"}, "it is included wxml"),
      /*<!--expand include from folder/include_lv1.wxml-->*/
      (/*_if_1 = */_cONTEXT.abc) && Rc('span', {"className": "wxmp-text"}, "it is included wxml in a sub wxml"),
      /*<!--expand include from folder/include_abs.wxml-->*/
      Rc('span', {"className": "wxmp-text"}, "it is included wxml by abs path")
    ]),
  ]);

  /*IF_VAR_DEFINE*/

  // var _if_0; // unused var
  // var _if_1; // unused var
}
