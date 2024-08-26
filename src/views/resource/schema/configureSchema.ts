/*
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-03-28 23:12:16
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-06-16 21:04:44
 * @FilePath: \drawStars-Vue3\src\views\resource\schema\configureSchema.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const allFields = [
  {
    fieldName: "name",
    label: "名称",
    type: "input",
    width: 200,
    rule: [{ required: true, message: "请输入名称", trigger: "blur" }],
  },
  {
    fieldName: "type",
    label: "类型",
    type: "select",
    width: 120,
    rule: [{ required: true, message: "请选择类型", trigger: "blur" }],
    placeholder: "请选择",
    config: {
      valueKey: "value",
      labelKey: "label",
    },
    options: [
      {
        label: "框架",
        value: "frame",
      },
      {
        label: "工具",
        value: "tool",
      },
      {
        label: "资源",
        value: "resource",
      },
      {
        label: "模块",
        value: "module",
      },
      {
        label: "其他",
        value: "other",
      },
    ],
  },
  {
    fieldName: "icon",
    label: "图标",
    type: "img",
  },
  {
    fieldName: "address",
    label: "地址",
    type: "link",
    width: 300,
  },
  {
    fieldName: "open_way",
    label: "打开方式",
    type: "select",
    rule: [{ required: true, message: "请选择打开方式", trigger: "blur" }],
    placeholder: "请选择",
    options: [
      {
        label: "新tab页签打开",
        value: "newTab",
      },
      {
        label: "当前窗口打开",
        value: "curWindow",
      },
      {
        label: "进入模块",
        value: "module",
      },
      {
        label: "其他",
        value: "other",
      },
    ],
  },
  {
    fieldName: "create_time",
    label: "创建时间",
    type: "date",
    width: 300,
    hideDialog: true,
  },
  {
    fieldName: "update_time",
    label: "修改时间",
    type: "date",
    width: 300,
    hideDialog: true,
  },
];

export const tableFields = allFields;
export const dialogFields = allFields.filter((s) => !s.hideDialog);
