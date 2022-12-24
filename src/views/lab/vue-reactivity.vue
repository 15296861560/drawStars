<template>
  <div></div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {},
  mounted() {
    var Person = {
      name: "lgy",
      action: "eat",
    };
    console.log(Person);
    //Object.defineProperty
    // let myReactive = function (obj, key, val) {
    //   Object.defineProperty(Person, key, {
    //     enumerable: true,
    //     configurable: false,
    //     set: function (value) {
    //       console.log("设置" + key);
    //       val = value;
    //     },
    //     get: function () {
    //       console.log("访问" + key);
    //       return val;
    //     },
    //   });
    // };

    // Object.keys(Person).forEach((key) => {
    //   myReactive(Person, key, Person[key]);
    // });

    // Person.name = "jack";
    // Person.action = "sleep";
    // console.log(Person);

    // 监听器 Observer
    function defineReactive(data, key, value) {
      //递归调用，监听所有属性
      observer(value);
      var dep = new Dep();
      Object.defineProperty(data, key, {
        get: function () {
          console.log("访问" + key);
          if (Dep.target) {
            dep.addSub(Dep.target);
          }
          return value;
        },
        set: function (newVal) {
          console.log("设置" + key);
          if (value !== newVal) {
            console.log(key + "有变化");
            value = newVal;
            dep.notify(); //通知订阅器
          }
        },
      });
    }

    function observer(data) {
      if (!data || typeof data !== "object") {
        return;
      }
      //如果data是对象递归调用
      Object.keys(data).forEach((key) => {
        defineReactive(data, key, data[key]);
      });
    }

    function Dep() {
      this.subs = [];
    }
    Dep.prototype.addSub = function (sub) {
      this.subs.push(sub);
    };
    Dep.prototype.notify = function () {
      console.log("属性变化通知 Watcher 执行更新视图函数");
      this.subs.forEach((sub) => {
        sub.update();
      });
    };
    Dep.target = {};
    Dep.target.update = function () {
      console.log("更新视图");
    };

    observer(Person);
    Person.name = "Lucy";
    console.log(Person);
    Person.name = "Amy";
  },
};
</script>
<style></style>
