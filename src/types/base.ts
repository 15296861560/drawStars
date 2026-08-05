/**
 * 自定义通用组件 Type 类
 */
export type IComponentType =
  | 'input'
  | 'inputNumber'
  | 'textarea'
  | 'select'
  | 'cascade'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'img'
  | 'upload'
  | 'location'
  | 'locationPoint'
  | 'richText'

export enum ComponentType {
  input = 'input',
  inputNumber = 'inputNumber',
  textarea = 'textarea',
  select = 'select',
  cascade = 'cascade',
  date = 'date',
  radio = 'radio',
  checkbox = 'checkbox',
  img = 'img',
  upload = 'upload',
  location = 'location',
  locationPoint = 'locationPoint',
  richText = 'richText'
}
