
  Flex({wrap: FlexWrap.Wrap} /*entry-s1*/) {
    Text(""/*uuid="entry-s2::rich-text"*/
    ) {
    if (this.attr1) {
            Span("single if" /*entry-s2*/)
        }
    if (this.attr2) {
            Span("if with else if" /*entry-s4*/)
        }
    else if (this.attr3) {
            Span("with else if bu no else" /*entry-s6*/)
        }
    if (this.attr4) {
            Span("if with else" /*entry-s8*/)
        }
    else {
            Span("else end" /*entry-s10*/)
        }
    if (this.attr5) {
            Span("if with .. " /*entry-s12*/)
        }
    else if (this.attr6) {
            Span("else if 6" /*entry-s14*/)
        }
    else if (this.attr7) {
            Span("else if 7" /*entry-s16*/)
        }
    else if (this.attr8) {
            Span("else if 8" /*entry-s18*/)
        }
    else {
            Span("else end" /*entry-s20*/)
        }
    }.backgroundColor(0xFF0000).height("100vp").width("100vp")
  }.backgroundColor(0x0000FF)
  .width("100%"/*display block default*/)

