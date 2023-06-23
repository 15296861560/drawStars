<!--
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-08-14 21:51:00
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-24 01:13:06
-->
<template>
  <div>
    <ul class="tag-list" v-show="$route.name === '游戏'">
      <li
        class="tag"
        v-for="(game, index) in games"
        :key="game.name"
        @click="showGame(game.path)"
      >
        {{ $t(game.name) }}
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>
<script>
import { i18nLabelMixin } from "@/views/mixin/i18nLabelMixin";
export default {
  mixins: [i18nLabelMixin],
  data() {
    return {
      games: [
        { name: "2048", path: "2048" },
        { name: "gobang", path: "gobang" },
      ],
    };
  },
  methods: {
    showGame(path) {
      this.$router.push({
        path: `/home/caseHomePage/games/${path}`,
      });
    },
  },
};
</script>
<style lang="less" scoped>
.tag-list {
  padding: 0.625rem /* 10/16 */;
  .tag {
    background-color: #ecf5ff;
    display: inline-block;
    height: 2rem /* 32/16 */;
    padding: 0 0.625rem /* 10/16 */;
    line-height: 1.875rem /* 30/16 */;
    font-size: 0.75rem /* 12/16 */;
    color: @color-text-selected;
    border: 1px solid @color-border-highlight-selected;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
    margin-right: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
<i18n>
{
  "en": {
    "2048":"2048",
    "gobang":"gobang"
  },
  "zh": {
    "2048":"2048",
    "gobang":"五子棋"
  }
}
</i18n>
