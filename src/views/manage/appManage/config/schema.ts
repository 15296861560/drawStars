export const allFields = [
  {
    fieldName: "name",
    label: "应用名称",
    type: "input",
    width: 150,
    rule: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
  },
  {
    fieldName: "description",
    label: "应用描述",
    type: "textarea",
    width: 200,
    placeholder: "请输入应用描述",
  },
  {
    fieldName: "version",
    label: "版本号",
    type: "input",
    width: 100,
    rule: [{ required: true, message: "请输入版本号", trigger: "blur" }],
  },
  {
    fieldName: "status",
    label: "状态",
    type: "select",
    width: 100,
    rule: [{ required: true, message: "请选择状态", trigger: "blur" }],
    placeholder: "请选择",
    config: {
      valueKey: "value",
      labelKey: "label",
    },
    options: [
      {
        label: "已发布",
        value: "published",
      },
      {
        label: "未发布",
        value: "unpublished",
      },
      {
        label: "开发中",
        value: "developing",
      },
      {
        label: "草稿",
        value: "draft",
      },
    ],
  },
  {
    fieldName: "icon",
    label: "图标",
    type: "img",
    width: 80,
  },
  {
    fieldName: "category",
    label: "分类",
    type: "select",
    width: 120,
    rule: [{ required: true, message: "请选择分类", trigger: "blur" }],
    placeholder: "请选择",
    config: {
      valueKey: "value",
      labelKey: "label",
    },
    options: [
      {
        label: "工具类",
        value: "tool",
      },
      {
        label: "游戏类",
        value: "game",
      },
      {
        label: "办公类",
        value: "office",
      },
      {
        label: "社交类",
        value: "social",
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
    width: 180,
    hideDialog: true,
  },
  {
    fieldName: "update_time",
    label: "更新时间",
    type: "date",
    width: 180,
    hideDialog: true,
  },
  {
    fieldName: "file_path",
    label: "文件",
    type: "upload",
    width: 180,
    attrs: {
      field: {
        controlCongfig: {
          fileType: [3],
        },
      },
    },
  },
];

export const tableFields = allFields;
export const dialogFields = allFields.filter((s) => !s.hideDialog);
