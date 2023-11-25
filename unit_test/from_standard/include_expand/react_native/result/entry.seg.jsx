[
  <Text className="tag-text" /*uuid="entry-s1"*/ >include test</Text>,
  <View className="tag-view" /*uuid="entry-s3"*/ >
    {/*<!--expand include from folder/include_lv0.wxml-->*/}
    {(/*_if_0 = */(_cONTEXT.abc && _cONTEXT.bcd)) && <Text className="tag-text" /*uuid="entry-s5"*/ >it is included wxml</Text>}
    {/*<!--expand include from folder/include_lv1.wxml-->*/}
    {(/*_if_1 = */_cONTEXT.abc) && <Text className="tag-text" /*uuid="entry-s8"*/ >it is included wxml in a sub wxml</Text>}
    {/*<!--expand include from folder/include_abs.wxml-->*/}
    <Text className="tag-text" /*uuid="entry-s11"*/ >it is included wxml by abs path</Text>
  </View>,
];


/*IF_VAR_DEFINE*/

// var _if_0; // unused var
// var _if_1; // unused var