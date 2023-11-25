Column() {
  ForEach(this.loopData,
    (item, index) => {
      Row(/*entry-s1*/)
    },
    (item) => (item)
  )
  ForEach(this.loopData,
    (item2, index) => {
      Column(/*entry-s2*/) {
        Text((("\n" + item2.text) + "\n") /*entry-s2::auto-text-0*/)
      }.width("100%"/*display block default*/)
    },
    (item2) => (item2.id)
  )
  ForEach(this.loopData,
    (item3, index) => {
      if ((index & 1)) {
        Column(/*entry-s4*/) {
          Text((((("\n" + item3.index) + ": ") + item3.text) + "\n") /*entry-s4::auto-text-0*/)
          Row(/*entry-s6*/) {
            Text("  innerText" /*entry-s7*/)
          }.width("100%"/*display block default*/)
          .alignItems(VerticalAlign.Top)
        }.width("100%"/*display block default*/)
      }
    },
    (item3) => (item3.id3)
  )
  if (this.outsideIf) {
    ForEach(this.loopData,
      (item4, index) => {
        Column(/*entry-s9*/) {
          Text((((("\n" + item4.index) + ": ") + item4.text) + "\n") /*entry-s9::auto-text-0*/)
        }.width("100%"/*display block default*/)
      },
      (item4) => (item4.id4)
    )
  }
  ForEach(this.loopData,
    (item5, index5) => {
      Column(/*entry-s11*/) {
        ForEach(item5.subArr,
          (item6, index) => {
            Flex({wrap: FlexWrap.Wrap} /*entry-s12*/) {
              ForEach(item6.subSubArr,
                (item5, index) => {
                  Text("conflict for-item name" /*entry-s13*/)
                },
                (item5) => (item5)
              )
              ForEach(item6.subSubArr,
                (item, index) => {
                  Text("conflict for-index name" /*entry-s15*/)
                },
                (item) => (item)
              )
              ForEach(item6.subSubArr,
                (item7, index7) => {
                  Text("nothing conflict" /*entry-s17*/)
                },
                (item7) => (item7)
              )
            }.width("100%"/*display block default*/)
          },
          (item6) => (item6.idSub)
        )
      }.width("100%"/*display block default*/)
    },
    (item5) => (item5.id5)
  )
}
