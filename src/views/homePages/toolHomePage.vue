<template>
  <div>
    <div class="g-home-module">
      <router-link to="/home/echarts/basicBar" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/bar.svg" alt="柱状图" />
          </div>
          <div>
            <p class="m-p">柱状图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echarts/basicLine" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/line.svg" alt=" 折线图" />
          </div>
          <div>
            <p class="m-p">折线图</p>
          </div>
        </div>
      </router-link>
      <router-link to="/home/echarts/basicPie" class="m-router-link">
        <div class="m-home-button">
          <div class="m-img">
            <img class="m-home-img" src="@/assets/img/pie.svg" alt="饼图" />
          </div>
          <div>
            <p class="m-p">饼图</p>
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
