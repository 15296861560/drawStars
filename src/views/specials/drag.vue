<template>
  <div class="box">
    <div>
      <div class="title">Sortable</div>
      <div>
        <div class="box-row">
          <div class="group-title">groupA</div>
          <div class="group" ref="groupA">
            <div class="card card1" v-for="(item, index) in groupAData" :key="index">
              {{ item.text }}
            </div>
          </div>
        </div>
        <div class="box-row">
          <div class="group-title">groupB</div>
          <div class="group" ref="groupB">
            <div class="card card2" v-for="(item, index) in groupBData" :key="index">
              {{ item.text }}
            </div>
          </div>
        </div>
        <div class="box-row">
          <div class="group-title">groupC</div>
          <div class="group" ref="groupC">
            <div class="card card3" v-for="(item, index) in groupCData" :key="index">
              {{ item.text }}
            </div>
          </div>
        </div>
        <div v-show="curShowData" class="data-tip">{{ curShowData }}</div>
        <el-form
          ref="form"
          label-position="left"
          label-width="100px"
          style="margin: 10px"
        >
          <el-form-item label="ID">
            <el-input v-model="groupIds" disabled></el-input>
          </el-form-item>
          <el-form-item label="Text">
            <el-input v-model="groupTexts" disabled></el-input>
          </el-form-item>
        </el-form>
        <el-button
          size="medium"
          type="success"
          @click="printGroup(groupAData, 'groupAData')"
        >
          <span>输出GroupA</span>
        </el-button>
        <el-button
          size="medium"
          type="success"
          @click="printGroup(groupBData, 'groupBData')"
        >
          <span>输出GroupB</span>
        </el-button>
        <el-button
          size="medium"
          type="success"
          @click="printGroup(groupCData, 'groupCData')"
        >
          <span>输出GroupC</span>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script>
import Sortable from "sortablejs";
import { cloneDeep } from "lodash";
export default {
  data() {
    return {
      groupIds: "",
      groupTexts: "",
      groupAData: [
        { id: "a1", text: "111" },
        { id: "a2", text: "222" },
        { id: "a3", text: "333" },
        { id: "a4", text: "444" },
        { id: "a5", text: "555" },
        { id: "a6", text: "666" },
      ],
      groupBData: [
        { id: "b1", text: "111" },
        { id: "b2", text: "222" },
        { id: "b3", text: "333" },
        { id: "b4", text: "444" },
        { id: "b5", text: "555" },
        { id: "b6", text: "666" },
      ],
      groupCData: [
        { id: "c1", text: "111" },
        { id: "c2", text: "222" },
        { id: "c3", text: "333" },
        { id: "c4", text: "444" },
        { id: "c5", text: "555" },
        { id: "c6", text: "666" },
      ],
      curShowData: "",
    };
  },
  mounted() {
    this.initSortable();
  },
  methods: {
    initSortable() {
      const groupElA = this.$refs.groupA;
      const groupElB = this.$refs.groupB;
      const groupElC = this.$refs.groupC;
      const optionA = {
        group: "sameGroup",
        //是否允许列内部排序，如果为false当有多个排序组时,多个组之间可以拖拽，本身不能拖拽
        sort: true,
        //动画效果
        animation: 500,
        // Easing 动画
        easing: "ease",
        //停靠位置的自定义样式
        ghostClass: "ghost",
        //选中元素的自定义样式
        chosenClass: "chosen",
        //拖拽时的自定义样式
        dragClass: "drag",
        //忽略HTML5原生拖拽行为
        forceFallback: true,
        //拖动结束
        onEnd: this.onEndA,
        //  拖拽完后添加元素事件
        onAdd: this.onAddA,
      };
      const optionB = {
        group: "sameGroup",
        sort: true,
        ghostClass: "ghost",
        //忽略HTML5原生拖拽行为
        forceFallback: true,
        //拖动结束
        onEnd: this.onEndB,
      };
      const optionC = {
        sort: true,
        ghostClass: "ghost",
        filter: ".group-title",
      };
      let sortable1 = new Sortable(groupElA, optionA);
      let sortable2 = new Sortable(groupElB, optionB);
      let sortable3 = new Sortable(groupElC, optionC);
    },
    printGroup(groupData, dataName) {
      this.curShowData = dataName;
      this.groupIds = groupData
        .map((item) => {
          return item.id;
        })
        .join(",");
      this.groupTexts = groupData
        .map((item) => {
          return item.text;
        })
        .join(",");
    },
    onEndA(evt) {
      let newIndex = evt.newIndex;
      let oldIndex = evt.oldIndex;
      let newNode = evt.item;
      let group = evt.to;

      // 组间移动
      if (evt.to === evt.from) {
        this.groupAData.splice(newIndex, 0, ...this.groupAData.splice(oldIndex, 1));

        let oldNode = group.children[oldIndex];
        group.removeChild(newNode);
        if (newIndex > oldIndex) {
          group.insertBefore(newNode, oldNode);
        } else {
          group.insertBefore(newNode, oldNode.nextSibling);
        }
      } else {
        this.groupBData.splice(newIndex, 0, ...this.groupAData.splice(oldIndex, 1));

        group.removeChild(newNode);
        // 还原删除的节点
        let oldGroup = evt.from;
        let nextDrag = oldGroup.children[oldIndex];
        oldGroup.insertBefore(newNode, nextDrag);
      }
    },
    onEndB(evt) {
      let newIndex = evt.newIndex;
      let oldIndex = evt.oldIndex;
      let newNode = evt.item;
      let group = evt.to;

      // 组间移动
      if (evt.to === evt.from) {
        this.groupBData.splice(newIndex, 0, ...this.groupBData.splice(oldIndex, 1));

        let oldNode = group.children[oldIndex];
        group.removeChild(newNode);
        if (newIndex > oldIndex) {
          group.insertBefore(newNode, oldNode);
        } else {
          group.insertBefore(newNode, oldNode.nextSibling);
        }
      } else {
        this.groupAData.splice(newIndex, 0, ...this.groupBData.splice(oldIndex, 1));

        group.removeChild(newNode);
        // 还原删除的节点
        let oldGroup = evt.from;
        let nextDrag = oldGroup.children[oldIndex];
        oldGroup.insertBefore(newNode, nextDrag);
      }
    },
    onAddA(evt) {
      console.log("onAddA");
    },
  },
};
</script>
<style lang="less" scoped>
.box {
  display: flex;
  justify-content: center;

  .title {
    font-weight: bold;
  }

  .box-row {
    display: flex;
  }
}
.group {
  display: flex;
}
.group-title {
  font-weight: bold;
  background-color: cornsilk;
  &:extend(.card);
}
.card {
  width: 100px;
  height: 100px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card1 {
  background-color: @color-morandi-1;
}
.card2 {
  background-color: @color-morandi-2;
}
.card3 {
  background-color: @color-morandi-3;
}
.ghost {
  background-color: red;
}
.chosen {
  background-color: yellow;
  transform: scale(1.1);
}
.drag {
  background-color: aqua;
}
.data-tip {
  font-size: 32px;
  font-weight: bold;
  padding: 10px;
}
</style>
