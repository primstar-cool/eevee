(
  <View className="tag-div" /*uuid="entry-s1"*/ >
    <Text /*uuid="entry-s2"*/ >normarl text</Text>
    {/*<!-- single line comment-->*/}
    <Text /*uuid="entry-s5"*/ >{_cONTEXT.dynText}</Text>
    <Text /*autoText="1"*/ className="tag-div" style={getAutoTextStyle(null)}>{"\n    no tag text\n    "}</Text>
    {/*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/}
    <Image source={{uri: "abc"}} /*uuid="entry-s9"*/ />
    <Text test = {_cONTEXT.aa.bb[6]["77"].c} /*uuid="entry-s10"*/ />
    <View attr0="</div>" attr123 = {((_cONTEXT.attr1 + _cONTEXT.attr2) + "attr3")} className="tag-div tag-div_7_tag-div" /*uuid="entry-s11"*/ />
  </View>
);
