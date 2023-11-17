(
  <View /*uuid="entry-s1"*/ >
    {(_cONTEXT.loopData).map((item, idx) => (
        <Text /*uuid=">entry-s2" + null + */ >{((((("id:" + idx) + ", name:") + item.name) + ", pt: ") + item.point)}</Text>
      )
    )}
    {(_cONTEXT.loopData).map((item2) => (
        <View /*uuid=">entry-s4" + __index + */ >
          <Text /*uuid="entry-s5"*/ >{item2.name}</Text>
        </View>
      )
    )}
    {(_cONTEXT.loopData).map(() => (
        <Text /*uuid=">entry-s7" + __index + */ >empty</Text>
      )
    )}
    {(_cONTEXT.loopData).map((item3) => (
        <Text /*uuid=">entry-s9" + __index + */ >nouse</Text>
      )
    )}
  </View>
);


/*FOR_FUNC_DEFINE*/
// _for_map_fn_0 was ready inlined
// _for_map_fn_1 was ready inlined
// _for_map_fn_2 was ready inlined
// _for_map_fn_3 was ready inlined