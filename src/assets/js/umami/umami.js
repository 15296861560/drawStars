/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-01-20 23:42:39
 */

//埋点跟踪代码配置
import {
  umamiConfig
} from "./umami-config";

// 根据环境加载埋点跟踪代码信息配置
let dataWebsiteId = "";
if (process.env.NODE_ENV === 'production') {
  dataWebsiteId = umamiConfig.dataWebsiteIdProduction;
} else {
  dataWebsiteId = umamiConfig.dataWebsiteIdDev;
}

// 加载埋点跟踪代码
let script = document.createElement('script')
script.setAttribute('async', '')
script.setAttribute('defer', '')
script.setAttribute('data-website-id', dataWebsiteId)
script.setAttribute('src', umamiConfig.umamiSrc)
document.body.appendChild(script);


document.addEventListener("click", event => {
  if (event.path) {
    let event_value = "",
      event_type = "click";
    let cur = event.path[0]
    if (cur) {
      if (cur.innerText) //直接点了带文字的元素
        event_value = cur.innerText;
      else if (cur.alt) //alt有值的img标签
        event_value = cur.alt;
      else {
        //往外查询是否点击到a标签
        for (let i = 1, curItem = event.path[i]; curItem; i++) {
          if (curItem.tagName == "A") {
            cur = curItem;
            break;
          }
          curItem = event.path[i + 1];
        }

        if (cur.innerText) event_value = cur.innerText; //若a标签内有值取a标签的值
        else
          event_value = "点击位置未设值";
      }
    }

    umami.trackEvent(event_value, event_type);
  }

})