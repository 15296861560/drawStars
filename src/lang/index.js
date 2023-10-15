/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 23:44:29
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-03 14:59:51
 */
import {
  createI18n
} from 'vue-i18n';
// import elementEnLocale from 'element-plus/dist/locale/en.mjs'
// import elementZhLocale from 'element-plus/dist/locale/zh-cn.mjs'
import enLocale from './en';
import zhLocale from './zh';
import storage from '@/utils/commom/storage';
// import messages from '@intlify/vite-plugin-vue-i18n/messages'


const messages = {
  en: {
    ...enLocale,
    // ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    // ...elementZhLocale
  }
};
export function getLanguage() {
  const chooseLanguage = storage.local.get('LANGUAGE', '');
  if (chooseLanguage) {
    return chooseLanguage;
  }

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase();
  const locales = Object.keys(messages);
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale;
    }
  }
  return 'zh';
}


const i18n = createI18n({
  legacy: false, //  Composition API 模式
  // set locale
  // options: en | zh | es
  locale: getLanguage(),
  // set locale messages
  messages,
  silentTranslationWarn: true
});

export default i18n;