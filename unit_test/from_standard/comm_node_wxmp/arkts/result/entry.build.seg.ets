Column() {
  Flex(/*entry-s1*/) {
    Text("normarl text" /*entry-s2*/)
    /*<!-- single line comment-->*/
    Text(this.dynText /*entry-s5*/)
    Text("\n    no tag text\n    " /*entry-s1::auto-text-3*/)
    /*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/
    Image("abc" /*entry-s9*/)
    Row(/*entry-s10*/)
  }
  Text("multi node" /*entry-s11*/)
}
