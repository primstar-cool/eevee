Column() {
  Row(/*entry-s1*/) {
    Text(/*entry-s2-c-sub-text*/).fontColor(this.isBig ? (0x800080) : undefined)
  }
  .width(this.isBig ? ("528lpx") : ("192lpx"))
  .height("192lpx")
  .alignItems(VerticalAlign.Top)
  Row(/*entry-s3-c-classB*/) {
    Text(/*entry-s4-c-sub-text*/)
  }
  .id((this.idTest ? ("idT") : ("idF")) + "-extra")
  .width("96lpx")
  .height("96lpx")
  .alignItems(VerticalAlign.Top)
  Text(/*entry-s5*/)
  .fontColor(this.fontColor ? (0xFFFF00) : undefined)
  .backgroundColor(this.bgColor ? (0xFFC0CB) : undefined)
  Row(/*entry-s6*/)
  .width(this.is1 ? ("288lpx") : ("96lpx"))
  .height("96lpx")
  .backgroundColor({"@entry>view.type-1":(0xFF0000), "@entry>view.type-2":(0x0000FF), "@entry>view.type-3":(0x008000)}[("@entry>view" + this.genClassXPath(("type-" + (this.is1 ? ("1") : ((this.is2 ? ("2") : ("3")))))))])
  .margin(((!this.is1 && !this.is2)) ? ({"top": "72lpx"}) : undefined)
  .margin(((!this.is1 && !this.is2)) ? ({"right": "72lpx"}) : undefined)
  .margin(((!this.is1 && !this.is2)) ? ({"bottom": "72lpx"}) : undefined)
  .margin(((!this.is1 && !this.is2)) ? ({"left": "72lpx"}) : undefined)
}
.width("100%")
