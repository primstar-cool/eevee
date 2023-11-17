<script setup>
import { ref } from 'vue'

const dynText = ref('Hello World!');
const attr1 = ref(1);
const attr2 = ref("2");

</script>

<template>
<div>
    <span>normarl text</span>
    <!-- single line comment-->
    <span>{{dynText}}</span>
    no tag text
    <!-- multi
        <fakeNode>
        <open-node
         line comment-->
    <img src="abc"/>
    <span :test='aa.bb[6]["77"].c'/>
    <div attr0="</div>" :attr123="attr1+attr2 + 'attr3'" data-attr="<div>"/>
</div>
</template>

<style>
  div {
      background-color: blue;
  }
  div > div {
    background-color: red;
    height: 100px;
    width: 100px;
    display: flex;
    flex-direction: row;
  }
</style>
