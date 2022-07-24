<template>
  <div class="personal-profile">
    <div class="base-info">
      <div class="base-info-head">{{ $t("baseInfo") }}</div>

      <div class="base-info-content">
        <el-form
          ref="form"
          :model="personalData"
          label-width="7rem"
          label-position="right"
        >
          <el-form-item :label="$t('personalData.nickname')" required>
            <el-input v-model="personalData.nickname"></el-input>
          </el-form-item>

          <el-form-item :label="$t('personalData.introduction')">
            <el-input type="textarea" v-model="personalData.introduction"></el-input>
          </el-form-item>

          <el-form-item :label="$t('personalData.birthday')">
            <el-date-picker
              type="date"
              :placeholder="$t('placeholder.birthday')"
              v-model="personalData.birthday"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>

          <el-form-item :label="$t('personalData.gender')">
            <el-radio-group v-model="personalData.gender">
              <el-radio :label="$t('genderGroup.secrecy')" border></el-radio>
              <el-radio :label="$t('genderGroup.male')" border></el-radio>
              <el-radio :label="$t('genderGroup.female')" border></el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('personalData.region')" label-position="left">
            <el-cascader
              :placeholder="$t('placeholder.region')"
              v-model="personalData.region"
              :props="cascaderProps"
              class="region"
              @change="handleRegionChange"
            ></el-cascader>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="updateUserInfo">{{
              $t("btn.save")
            }}</el-button>
            <el-button @click="cancel">{{ $t("btn.cancel") }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import {
  queryPovinceList,
  queryCityList,
  queryAreaList,
  queryTownList,
} from "@/assets/js/api/resourceController/regionApi.js";
import {
  queryUserInfo,
  updateUserInfo,
} from "@/assets/js/api/profileController/profileApi.js";
const DEBOUNCE_TIME = 1000;
export default {
  data() {
    return {
      // 原始数据
      userData: {
        name: "Nickname",
        id: "User ID",
        gender: "保密",
        introduction: "Introduction",
        region: "shanghai",
        birthday: "",
      },
      // 界面数据
      personalData: {
        nickname: "",
        userID: "",
        gender: "",
        introduction: "",
        region: "",
        birthday: "",
      },
      cascaderProps: {
        lazy: true,
        lazyLoad(node, resolve) {
          let level = node.level;
          try {
            switch (level) {
              case 0:
                queryPovinceList().then((result) => {
                  let nodes = result.map((region) => {
                    return {
                      value: region.province,
                      label: region.name,
                      leaf: false,
                    };
                  });
                  resolve(nodes);
                });
                break;
              case 1:
                queryCityList({ province: node.value }).then((result) => {
                  let nodes = result.map((region) => {
                    return {
                      value: region.city,
                      label: region.name,
                      leaf: false,
                    };
                  });
                  if (!nodes.length) {
                    nodes = [
                      {
                        value: "01",
                        label: node.label,
                        leaf: false,
                      },
                    ];
                  }
                  resolve(nodes);
                });

                break;
              case 2:
                queryAreaList({ province: node.parent.value, city: node.value }).then(
                  (result) => {
                    let nodes = result.map((region) => {
                      return {
                        value: region.area,
                        label: region.name,
                        leaf: false,
                      };
                    });
                    resolve(nodes);
                  }
                );

                break;
              case 3:
                queryTownList({
                  province: node.parent.parent.value,
                  city: node.parent.value,
                  area: node.value,
                }).then((result) => {
                  let nodes = result.map((region) => {
                    return {
                      value: region.town,
                      label: region.name,
                      leaf: true,
                    };
                  });
                  resolve(nodes);
                });

                break;
              default:
                break;
            }
          } catch (error) {
            $message({
              type: "error",
              message: error.toString(),
            });
          }
        },
      },
    };
  },
  created() {
    this.initUserInfo();
  },
  methods: {
    // 初始化个人信息
    async initUserInfo() {
      this.userData = await queryUserInfo(this.$store.getters.getUserId);

      let { name, introduction, birthday, region, gender, phone } = this.userData;

      this.personalData = {
        nickname: name,
        gender: gender ? gender : this.$t("genderGroup.secrecy"),
        introduction: introduction,
        region: region ? region.split(",") : [],
        birthday: birthday,
      };
    },
    // 更新信息
    updateUserInfo: _.debounce(
      async function () {
        let params = {
          id: this.$store.getters.getUserId,
          name: this.personalData.nickname,
          introduction: this.personalData.introduction,
          birthday: this.personalData.birthday,
          region: this.personalData.region.toString(),
          gender: this.personalData.gender,
        };

        let res = await updateUserInfo(params);
        if (res.status) {
          this.userData = params;
          this.$message.success(this.$t("tip.updateSuccess"));
        } else {
          this.$message.error(this.$t("tip.updateFail"));
        }
      },
      DEBOUNCE_TIME,
      {
        leading: true,
        trailing: false,
      }
    ),
    // 取消
    cancel() {
      let { name, introduction, birthday, region, gender, phone } = this.userData;
      this.personalData = {
        nickname: name,
        gender: gender,
        introduction: introduction,
        region: region,
        birthday: birthday,
      };
    },
    handleRegionChange(value) {
      console.log(value);
    },
  },
};
</script>
<style lang="less" scoped>
.personal-profile {
  .base-info {
    display: flex;
    flex-direction: column;
    .base-info-head {
      height: 3rem /* 48/16 */;
      line-height: 3rem /* 48/16 */;
      text-align: left;
      font-size: 1.25rem /* 20/16 */;
      font-weight: bold;
      color: @color-text-normal;
      padding-left: 1rem /* 16/16 */;
      border-bottom: 1px solid @color-liner-border;
    }

    .base-info-content {
      padding: 1rem /* 16/16 */;
      .region {
        width: 100%;
      }
    }
  }
}
</style>
<i18n>
{
  "en": {
    "baseInfo": "Base Info",
    "personalData":{
          "nickname":"Nickname",
          "userID":"User ID",
          "gender":"Gender",
          "introduction":"Introduction",
          "region":"Region",
          "birthday":"Birthday"
    },
    "genderGroup":{
      "male":"Male",
      "female":"Female",
      "secrecy":"Secrecy"
    },
    "placeholder":{
      "nickname":"Please enter a nickname",
      "introduction":"Please enter your profile",
      "birthday":"Please select the date of birth",
      "region":"Please select your region"
    },
    "btn":{
      "save":"Save",
      "cancel":"Cancel"
    },
    "tip":{
      "updateSuccess":"Update Success",
      "updateFail":"Update Fail"
    }
    
  },
  "zh": {
     "baseInfo": "基本信息",
     "personalData":{
          "nickname":"用户昵称",
          "userID":"用户ID",
          "gender":"性别",
          "introduction":"个人简介",
          "region":"所在地区",
          "birthday":"出生日期"
      },
      "genderGroup":{
      "male":"男",
      "female":"女",
      "secrecy":"保密"
    },
    "placeholder":{
      "nickname":"请输入昵称",
      "introduction":"请输入个人简介",
      "birthday":"请选择出生日期",
      "region":"请选择所在区域"
    },
    "btn":{
      "save":"保存",
      "cancel":"取消"
    },
    "tip":{
      "updateSuccess":"更新成功",
      "updateFail":"更新失败"
    }
  }
}
</i18n>
