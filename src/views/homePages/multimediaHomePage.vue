<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/multimediaHomePage/simpleUse" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/multimedia/simple.svg"  />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.multimediaHomePage.simpleUse")}}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/multimediaHomePage/camera" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/multimedia/camera.svg"  />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.multimediaHomePage.camera")}}</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/multimediaHomePage/pictureEditing" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/multimedia/crop.svg"  />
          </div>
          <div>
            <p class="m-p">{{$t("homePage.multimediaHomePage.pictureEditing")}}</p>
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
