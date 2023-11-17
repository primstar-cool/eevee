[
  {(_cONTEXT.loopData).map((item, index) => (
      <View /*uuid=">entry-s1" + item + */ key={item}/>
    )
  )},
  {(_cONTEXT.loopData).map((item2, index) => (
      <View /*uuid=">entry-s2" + item2.id + */ key={item2.id}>
        <Text /*autoText="1"*/  style={getAutoTextStyle(null)}>{(("\n" + item2.text) + "\n")}</Text>
      </View>
    )
  )},
  {(_cONTEXT.loopData).map((item3, index) => ((index & 1) && (
      <View /*uuid=">entry-s4" + item3.id3 + */ key={item3.id3}>
        <Text /*autoText="1"*/  style={getAutoTextStyle(null)}>{(((("\n" + item3.index) + ": ") + item3.text) + "\n")}</Text>
        <View /*uuid="entry-s6"*/ >
          <Text /*uuid="entry-s7"*/ >  innerText</Text>
        </View>
      </View>
      )
    )
  )},
  {(_cONTEXT.outsideIf) && (_cONTEXT.loopData).map((item4, index) => (
      <View /*uuid=">entry-s9" + item4.id4 + */ key={item4.id4}>
        <Text /*autoText="1"*/  style={getAutoTextStyle(null)}>{(((("\n" + item4.index) + ": ") + item4.text) + "\n")}</Text>
      </View>
    )
  )},
  {(_cONTEXT.loopData).map(_for_map_fn_4)},
];


/*FOR_FUNC_DEFINE*/
// _for_map_fn_0 was ready inlined
// _for_map_fn_1 was ready inlined
// _for_map_fn_2 was ready inlined
// _for_map_fn_3 was ready inlined
function _for_map_fn_4(item5, index5) {
  return (
    <View /*uuid=">entry-s11" + item5.id5 + */ key={item5.id5}>
      {(item5.subArr).map(_for_map_fn_5)}
    </View>
  )
/*ends of _for_map_fn_4*/
  
  function _for_map_fn_5(item6, index) {
    return (
      <View /*uuid=">entry-s12" + item6.idSub + */ key={item6.idSub}>
        {(item6.subSubArr).map((item5, index) => (
            <Text /*uuid=">entry-s13" + item5 + */ key={item5}>conflict for-item name</Text>
          )
        )}
        {(item6.subSubArr).map((item, index) => (
            <Text /*uuid=">entry-s15" + item + */ key={item}>conflict for-index name</Text>
          )
        )}
        {(item6.subSubArr).map((item7, index7) => (
            <Text /*uuid=">entry-s17" + item7 + */ key={item7}>nothing conflict</Text>
          )
        )}
      </View>
    )
  /*ends of _for_map_fn_5*/
  }
}
// _for_map_fn_5 was ready inlined
// _for_map_fn_6 was ready inlined
// _for_map_fn_7 was ready inlined
// _for_map_fn_8 was ready inlined