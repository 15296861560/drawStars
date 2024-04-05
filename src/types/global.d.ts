// 值为任意类型的Object
export interface AnyObject {
  [key: string]: any
}


export interface Field {
  fieldName: string,
  label: string,
  type?: string,
  rule?: Array<AnyObject> | AnyObject,
  hideDialog?: boolean,
  hideTable?: boolean,
  [key: string]: any
}

export interface DialogOption {
  fieldList: Array<Field>;
  disabled?: boolean;
  readonly?: boolean;
  confirmMethod?: Function;
  confirmParams?: AnyObject;
  labelPosition?: string;
  [key: string]: any
}