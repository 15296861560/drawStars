<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/multimediaHomePage/simpleUse" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/multimedia/simple.svg"  />
          </div>
          <div>
            <p class="m-p">简单使用方式</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/multimediaHomePage/camera" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/multimedia/camera.svg"  />
          </div>
          <div>
            <p class="m-p">捕捉摄像头画面</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
 
  },
};
</script>
<style></style>
