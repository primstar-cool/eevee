<script setup>
import { ref } from 'vue'

const attr1 = ref(1);
const attr2 = ref("2");
const attr3 = ref(3);
const attr4 = ref("4");
const attr5 = ref(1);
const attr6 = ref("6");
const attr7 = ref(7);
const attr8 = ref(8);
</script>

<template>
<div>
    <span v-if="attr1">single if</span>


    <span v-if="attr2">if with else if</span>
    <span v-else-if="attr3">with else if bu no else</span>

    <span v-if="attr4">if with else</span>
    <span v-else>else end</span>

    <span v-if="attr5">if with .. </span>
    <span v-else-if="attr6">else if 6</span>
    <span v-else-if="attr7">else if 7</span>
    <span v-else-if="attr8">else if 8</span>
    <span v-else>else end</span>

</div>
</template>

<style>
  div {
      background-color: blue;
  }
  div > span {
    background-color: red;
    height: 100px;
    width: 100px;
  }
</style>
