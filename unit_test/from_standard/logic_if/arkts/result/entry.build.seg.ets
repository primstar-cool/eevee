
  Flex({wrap: FlexWrap.Wrap} /*entry-s1*/) {
    if (this.attr1) {
      Text("single if" /*entry-s2*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    if (this.attr2) {
      Text("if with else if" /*entry-s4*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else if (this.attr3) {
      Text("with else if bu no else" /*entry-s6*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    if (this.attr4) {
      Text("if with else" /*entry-s8*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else {
      Text("else end" /*entry-s10*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    if (this.attr5) {
      Text("if with .. " /*entry-s12*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else if (this.attr6) {
      Text("else if 6" /*entry-s14*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else if (this.attr7) {
      Text("else if 7" /*entry-s16*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else if (this.attr8) {
      Text("else if 8" /*entry-s18*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
    else {
      Text("else end" /*entry-s20*/).backgroundColor(0xFF0000).height("100px").width("100px")
    }
  }.backgroundColor(0x0000FF)
  .width("100%"/*display block default*/)

