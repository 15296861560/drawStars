<template>
  <div>
    <div class="g-home">
      <div class="g-home-module">
        <router-link to="/home/echartHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/bar.svg" alt="图表" />
            </div>
            <div>
              <p class="m-p">图表</p>
            </div>
          </div>
        </router-link>
        <router-link to="/home/toolHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/tool.svg" alt="工具" />
            </div>
            <div>
              <p class="m-p">工具</p>
            </div>
          </div>
        </router-link>
        <router-link to="/home/componentsHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/components.svg" alt="组件" />
            </div>
            <div>
              <p class="m-p">组件</p>
            </div>
          </div>
        </router-link>
        <router-link to="/home/specialHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/special.svg" alt="特效" />
            </div>
            <div>
              <p class="m-p">特效</p>
            </div>
          </div>
        </router-link>
        <router-link to="/home/dataHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/data.svg" alt="特效" />
            </div>
            <div>
              <p class="m-p">数据传输</p>
            </div>
          </div>
        </router-link>
        <router-link to="/home/multimediaHomePage" class="m-router-link">
          <div class="m-home-button">
            <div class="m-img">
              <img class="m-home-img" src="@/assets/img/multimedia.svg" alt="多媒体" />
            </div>
            <div>
              <p class="m-p">多媒体</p>
            </div>
          </div>
        </router-link>
      </div>
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
