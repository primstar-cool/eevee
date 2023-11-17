Column() {
  Flex(/*entry-s1*/) {
    Text(/*entry-s2-c-sub-text*/).fontColor(this.isBig ? (0x800080) : undefined)
  }
  .width(this.isBig ? ("528lpx") : ("192lpx"))
  .height("192lpx")
  Flex(/*[object Object]-c-classB*/) {
    Text(/*entry-s3-c-sub-text*/)
  }
  .width("96lpx")
  .height("96lpx")
  Text(/*entry-s4*/)
  .fontColor(this.fontColor ? (0xFFFF00) : undefined)
  .backgroundColor(this.bgColor ? (0xFFC0CB) : undefined)
  Row(/*entry-s5*/)
  .width(this.is1 ? ("288lpx") : ("96lpx"))
  .height("96lpx")
  .backgroundColor({"@entry>view.type-1":(0xFF0000), "@entry>view.type-2":(0x0000FF), "@entry>view.type-3":(0x008000)}[ ("@entry>view" + genClassXPath(("type-" + (this.is1 ? ("1") : ((this.is2 ? ("2") : ("3")))))))])
  .borderWidth(( (!this.is1 && this.is2)) ? ("2px") : undefined)
  .margin(( (!this.is1 && !this.is2)) ? ("72lpx") : undefined)
}
