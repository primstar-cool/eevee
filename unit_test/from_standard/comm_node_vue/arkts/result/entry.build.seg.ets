
  Flex({wrap: FlexWrap.Wrap} /*entry-s1*/) {
    Text("normarl text" /*entry-s2*/)
    /*<!-- single line comment-->*/
    Text(this.dynText /*entry-s5*/)
    Text("\n    no tag text\n    " /*entry-s1::auto-text-3*/)
    /*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/
    Image("abc" /*entry-s9*/)
    Text(/*entry-s10*/)
    Row(/*entry-s11*/)
    .backgroundColor(0xFF0000)
    .height("100px")
    .width("100px")
  }.backgroundColor(0x0000FF)
  .width("100%"/*display block default*/)

