/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-13 22:41:37
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-23 15:19:11
 */
import Vue from 'vue'

const copy = {
  bind(el, {
    value
  }) {
    el.$value = value
    el.handler = () => {
      if (!el.$value) {
        Vue.prototype.$message({
          type: "error",
          message: '无复制内容',
        });
        return
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea')
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = 'readonly'
      textarea.style.position = 'absolute'
      textarea.style.left = '-100vw'
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea)
      // 选中值并复制
      textarea.select()
      const result = document.execCommand('Copy')
      if (result) {
        // 根据情况进行成功提示
        Vue.prototype.$message({
          type: "success",
          message: '复制成功',
        });
      }
      document.body.removeChild(textarea)
    }
    // 绑定触发事件(根据需求选择触发事件)
    el.addEventListener('click', el.handler)
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, {
    value
  }) {
    el.$value = value
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler)
  },
}

export default copy
