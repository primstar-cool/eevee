Column() {
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
    Row(/*entry-s10*/)
  }.width("100%"/*display block default*/)
  Text("multi node" /*entry-s11*/)
}
