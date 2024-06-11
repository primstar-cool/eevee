
  Flex({wrap: FlexWrap.Wrap} /*entry-s1*/) {
    Text("normarl text" /*entry-s2*/)
    /*<!-- single line comment-->*/
    Text(""/*uuid="entry-s5::rich-text"*/
    ) {
      Span(this.dynText /*entry-s5*/)
      Span("\n    no tag text\n    " /*entry-s1::auto-text-3*/)
    }    /*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/
    Image("abc" /*entry-s9*/)
    Text(/*entry-s10*/)
    Row(/*entry-s11*/)
    .backgroundColor(0xFF0000)
    .height("100vp")
    .width("100vp")
  }.backgroundColor(0x0000FF)
  .width("100%"/*display block default*/)

