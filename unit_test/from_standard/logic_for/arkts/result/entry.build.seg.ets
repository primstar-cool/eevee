
  Row(/*entry-s1*/) {
    ForEach(this.loopData,
      (item, idx) => {
        Text(((((("id:" + idx) + ", name:") + item.name) + ", pt: ") + item.point) /*entry-s2*/)
      }
    )
    ForEach(this.loopData,
      (item2) => {
        Row(/*entry-s4*/) {
          Text(item2.name /*entry-s5*/)
        }
      }
    )
    ForEach(this.loopData,
      () => {
        Text("empty" /*entry-s7*/)
      }
    )
    ForEach(this.loopData,
      (item3) => {
        Text("nouse" /*entry-s9*/)
      }
    )
  }

