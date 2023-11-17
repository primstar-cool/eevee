function entry (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {
  return Rc("div", null, [
    Rc('div', {}, [
      Rc('span', {}, "normarl text"),
      /*<!-- single line comment-->*/
      Rc('span', {}, _cONTEXT.dynText),
      "\n    no tag text\n    ",
      /*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/
      Rc('image', {"src": "abc"} ),
      Rc('text', {"test": _cONTEXT.aa.bb[6]["77"].c} ),
      Rc('div', {"attr0": "</div>", "data-attr": "<div>", "attr123": ((_cONTEXT.attr1 + _cONTEXT.attr2) + "attr3")} )
    ]),
  ]);
}
