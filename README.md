# eevee
一个工具集致力提供鸿蒙arkts/vue/react/rn/各类小程序/快应用的UI代码的互转;
a toolkit focus on mutual convert UI code of arkts(harmony)/vue/react/react native/mini programe(wx,tt,baidu,ks)/hap;



# how to use / 怎么使用
see code in folder unit_test, convert a source code to eevee-standard-json, and convert eevee-standard-json to destination;

看unit_test中的代码，他演示了如何从源语言转换为eevee标准json，再从eevee标准json转为目标语言。

# source code type / 源语言类型
wxmp(without wxs translation);vue (vue 2 style);react_native(just a simple support);arkts(developing...);

微信小程序(不支持wxs解析)；vue (vue2风格);react_native(仅简单支持);arkts(开发中...)；

# destination code type (some of them were outdated and will not be updated)  / 目标语言类型（有些过时了将不再更新）
vue2/vue3/react/react native/harmony arkts/android hap app/wxmp/ttma/swan/ksmp/graphics render[cpp(opengl 1.x/2.x/D3D9/D3D11); js(canvas/webgl); as3(flash stage2d/stage3s)]

vue2/vue3/react/react native/鸿蒙arkts/安卓快应用/小程序(微信/头条/百度/快手)/图形渲染[cpp(opengl 1.x/2.x/D3D9/D3D11); js(cavas/webgl); as3(flash stage2d/stage3s)]


*unity3d(C#)/ios widget(swift) will be supported if I have time; Flutter(Dart)/uniapp will not be supported since they were already designed for multi-platform；

*unity3d(C#)/ios widget(swift)等我有时间会支持下；Flutter(Dart)/uniapp应该不会支持，它们本就为跨平台设计。

# how about covert logic code / 逻辑代码如何转换
logic code convert across multi platfrom is nearly impossible，but It is possible that convert from one to another. in fact, I have lots of projects support multi-platfrom in a same trunk. this project will force on convert ui code, but will provide some example code to support multi-platform isomorphism.

逻辑代码在多平台间互转是几乎不可能的，但是一种到另一种倒是可能的。事实上，笔者有很多支持多平台的项目是同一套代码. 这套工具集致力于UI代码的转换，但会提供一些实例代码帮助完成多平台同构。


# reason of create this library / 为什么做这个库
harmony arkts is too new to create apps easily, it will help developer to convert exist project. If more and more developers use arkts as source code, it will help developers port code to others. yylx;

鸿蒙arkts有点新，创建app没那么容易，它可以帮助开发者转换现有项目。当越来越多的开发者使用arkts作为源代码，它还可以帮助开发者移植到其他平台。遥遥领先。

