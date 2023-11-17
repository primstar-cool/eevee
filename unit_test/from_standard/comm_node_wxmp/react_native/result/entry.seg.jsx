[
  <View /*uuid="entry-s1"*/ >
    <Text /*uuid="entry-s2"*/ >normarl text</Text>
    {/*<!-- single line comment-->*/}
    <Text /*uuid="entry-s5"*/ >{_cONTEXT.dynText}</Text>
    <Text /*autoText="1"*/  style={getAutoTextStyle(null)}>{"\n    no tag text\n    "}</Text>
    {/*<!-- multi
        <fakeNode>
        <open-node
         line comment-->*/}
    <Image source={{uri: "abc"}} /*uuid="entry-s9"*/ />
    <View attr0="</view>" attr123 = {((_cONTEXT.attr1 + _cONTEXT.attr2) + "attr3")} /*uuid="entry-s10"*/ />
  </View>,
  <Text /*uuid="entry-s11"*/ >multi node</Text>,
];
