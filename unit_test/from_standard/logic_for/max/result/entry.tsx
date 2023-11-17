import View from '@hfe/max-view';
import Text from '@hfe/max-text';
import Image from '@hfe/max-image';
import {useState} from '@max/max';








export default (_props_cONTEXT: any) => {
  
  const [_cONTEXT] = useState<any>({} as any);
  const [_last_props_cONTEXT] = useState<any>({} as any);

  // console.log(Object.keys(_props_cONTEXT));

  for (var key in _props_cONTEXT) {
    if (deepDiff(_props_cONTEXT[key], _last_props_cONTEXT[key])) {
      _cONTEXT[key] = _props_cONTEXT[key];
    }
  }// merge ui change in to dest props
  Object.assign(_last_props_cONTEXT as any, _props_cONTEXT);
  
  
  
  


  //////init $GLOABL/////
  
  

  return (
    <View /*uuid="entry-s1"*/ >
      {{(_for_tmp_ = _cONTEXT.loopData) && _getIterFunc(_for_tmp_)((item, idx) => _for_map_fn_0)}}
      {{(_for_tmp_ = _cONTEXT.loopData) && _getIterFunc(_for_tmp_)((item2) => _for_map_fn_1)}}
      {{(_for_tmp_ = _cONTEXT.loopData) && _getIterFunc(_for_tmp_)(() => _for_map_fn_2)}}
      {{(_for_tmp_ = _cONTEXT.loopData) && _getIterFunc(_for_tmp_)((item3) => _for_map_fn_3)}}`
    </View>
  );
  
  
  /*FOR_FUNC_DEFINE*/
  var _for_tmp_;
  function _getIterFunc(obj) {
    if (obj.forEach) return obj.forEach;
    else {
      let _ks = Object.keys(obj);
      return (iterFunc) => {
        _ks.forEach(
          (_k, _idx) => {
            iterFunc(obj[_k], _k); // same as wxmp
          }
        )
      }
    }
  }
    // _for_map_fn_0 was ready inlined
    // _for_map_fn_1 was ready inlined
    // _for_map_fn_2 was ready inlined
    // _for_map_fn_3 was ready inlined

}


function deepDiff(newVal:any, oldVal:any, treatNaNAsSame = true) {
  
  if (newVal === oldVal) {
    return false;
  }
  var newType = typeof newVal;
  var oldType = typeof oldVal;
  
  // console.ASSERT(newType !== 'function' && oldType !== 'function', 'error deepDiff function');

  if (newType !== oldType) {
    return true;
  }
  
  if (newType === 'object') {
    if (Object.prototype.toString.call(newVal) !== Object.prototype.toString.call(oldVal)) {
      return true;
    }

    if (Object.keys(newVal).length !== Object.keys(oldVal).length)
      return true;
    
    for (var key in newVal) {
      if (!oldVal.hasOwnProperty(key))
        return true;
      var newValKeyVal = newVal[key];
      var oldValKeyVal = oldVal[key];
      
      if (newValKeyVal === oldValKeyVal) {
        continue;
      }
      
      if (deepDiff(newValKeyVal, oldValKeyVal)) {
        return true;
      }
    
    }

    return false;
  } else if (treatNaNAsSame && newType === 'number') {
    if (isNaN(newVal) && isNaN(oldVal))
      return false;
  }
  
  return true;
}

/* unused function getAutoTextStyle */
/* unused function getFitCssClass */
