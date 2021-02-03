<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/echartHomePage/basicBar" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/bar.svg" alt="柱状图" />
          </div>
          <div>
            <p class="m-p">柱状图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echartHomePage/basicLine" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/echarts/line.svg" alt=" 折线图" />
          </div>
          <div>
            <p class="m-p">折线图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echartHomePage/basicArea" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/echarts/area.svg" alt=" 基础面积图" />
          </div>
          <div>
            <p class="m-p">基础面积图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echartHomePage/basicPie" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/echarts/pie.svg" alt="饼图" />
          </div>
          <div>
            <p class="m-p">饼图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echartHomePage/baiduMap" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/echarts/map.svg" />
          </div>
          <div>
            <p class="m-p">地图</p>
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
  methods: {},
};
</script>
<style></style>
