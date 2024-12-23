/**
 * 自定义通用组件 Type 类
 */
export type IComponentType =
  | "input"
  | "inputNumber"
  | "textarea"
  | "select"
  | "cascade"
  | "date"
  | "radio"
  | "checkbox"
  | "img"
  | "location";

export enum ComponentType {
  input = "input",
  inputNumber = "inputNumber",
  textarea = "textarea",
  select = "select",
  cascade = "cascade",
  date = "date",
  radio = "radio",
  checkbox = "checkbox",
  img = "img",
  locationPoint = "locationPoint",
  location = "location",
}
