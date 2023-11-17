function entry (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {
  return Rc("div", null, [
    Rc('div', {}, [
      Rc('span', {"className": "wxmp-text"}, "normarl text"),
      /*<!-- single line comment-->*/
      Rc('span', {"className": "wxmp-text"}, _cONTEXT.dynText),
      "\n    no tag text\n    ",
      /*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/
      Rc('img', {"src": "abc"} ),
      Rc('div', {"attr0": "</view>", "attr123": ((_cONTEXT.attr1 + _cONTEXT.attr2) + "attr3"), "data-__data-set-need-parse": 1,"data-attr": "\"<view>\""} )
    ]),
    Rc('span', {"className": "wxmp-text"}, "multi node"),
  ]);
}
