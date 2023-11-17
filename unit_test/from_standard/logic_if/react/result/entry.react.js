function entry (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {
  return Rc("div", null, [
    Rc('div', {}, [
      (/*_if_0 = */_cONTEXT.attr1) && Rc('span', {}, "single if"),
      (_if_1 = _cONTEXT.attr2) && Rc('span', {}, "if with else if"),
      !_if_1 && (/*_if_2 = */(_cONTEXT.attr3)) && Rc('span', {}, "with else if bu no else"),
      (_if_3 = _cONTEXT.attr4) && Rc('span', {}, "if with else"),
      !_if_3 && Rc('span', {}, "else end"),
      (_if_4 = _cONTEXT.attr5) && Rc('span', {}, "if with .. "),
      !_if_4 && (_if_5 = (_cONTEXT.attr6)) && Rc('span', {}, "else if 6"),
      !_if_4 && !_if_5 && (_if_6 = (_cONTEXT.attr7)) && Rc('span', {}, "else if 7"),
      !_if_4 && !_if_5 && !_if_6 && (_if_7 = (_cONTEXT.attr8)) && Rc('span', {}, "else if 8"),
      !_if_4 && !_if_5 && !_if_6 && !_if_7 && Rc('span', {}, "else end")
    ]),
  ]);

  /*IF_VAR_DEFINE*/

  // var _if_0; // unused var
  var _if_1;
  // var _if_2; // unused var
  var _if_3;
  var _if_4;
  var _if_5;
  var _if_6;
  var _if_7;
}
