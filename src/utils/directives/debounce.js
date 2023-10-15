/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-13 22:45:54
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-20 23:31:22
 */
const debounce = {
  mounted(el, binding) {
    let timer;
    el.addEventListener('click', () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        binding.value();
      }, 1000);
    });
  },
};

export default debounce;