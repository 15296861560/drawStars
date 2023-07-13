/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2023-06-24 01:09:58
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-24 01:12:06
 */
import {
  useI18n
} from "vue-i18n";
export const i18nLabelMixin = {
  methods: {
    initLocalLang() {
      const {
        t
      } = useI18n({
        inheritLocale: true,
      });
      this.$t = t;
    },
  },
  created() {
    this.initLocalLang();
  },
}