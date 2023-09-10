<template>
  <div>
    <iframe class="normal-frame" :src="frameSrc"></iframe>
  </div>
</template>
<script>
export default {
  data() {
    return {
      frameSrc: "http://localhost:8883/",
    };
  },
  methods: {},
};
</script>
<style>
.normal-frame {
  width: 100%;
  height: calc(100vh - 182px);
  border: none;
}
</style>
