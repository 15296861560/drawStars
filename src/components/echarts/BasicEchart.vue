<template>
  <div>
    <div :id="echartId" class="m-echart-components"></div>
  </div>
</template>

<script>
import { echartMixin } from "../mixin/echartMixin";
export default {
  mixins: [echartMixin],
};
</script>
