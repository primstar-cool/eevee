Column() {
  Text("include test" /*entry-s1*/).fontColor(0xFF0000).fontSize("30px").fontWeight(FontWeight.Bold)
  Flex(/*entry-s3*/) {
    /*<!--expand include from folder/include_lv0.wxml-->*/
    if ((this.abc&&this.bcd)) {
      Text("it is included wxml" /*entry-s5*/).fontColor(0xFF0000).fontSize("30px").fontWeight(FontWeight.Bold)
    }
    /*<!--expand include from folder/include_lv1.wxml-->*/
    if (this.abc) {
      Text("it is included wxml in a sub wxml" /*entry-s8*/).fontColor(0xFF0000).fontSize("30px").fontWeight(FontWeight.Bold)
    }
    /*<!--expand include from folder/include_abs.wxml-->*/
    Text("it is included wxml by abs path" /*entry-s11*/).fontColor(0xFF0000).fontSize("30px").fontWeight(FontWeight.Bold)
  }
  .width("720lpx")
  .height(0.5 * SCREEN_HEIGHT)
}
