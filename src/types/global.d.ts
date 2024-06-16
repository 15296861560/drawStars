/*
 * @Author: “lgy lgy-lgy@qq.com
 * @Date: 2024-03-25 23:31:20
 * @LastEditors: “lgy lgy-lgy@qq.com
 * @LastEditTime: 2024-06-16 20:02:55
 * @FilePath: \drawStars-Vue3\src\types\global.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
  width?: string|number,
  minWidth?: string|number,
  [key: string]: any
}

export interface DialogOption {
  fieldList: Array<Field>;
  disabled?: boolean;
  readonly?: boolean;
  confirmMethod?: Function;
  confirmParams?: AnyObject;
  labelPosition?: string;
  [key: string]: any;
}

export interface Operate {
  label:string;
  color?:string;
  type?:string;
  action:Function;
  show?:Function;
  disabled?:Function;
  loading?:boolean | Ref;
}

export interface TableOption {
  tableData: Array<any>;
  tableFields: Array<Field>;
  showIndex?: boolean;
  showSelection?: boolean;
  pageTableOperate?: Array<Operate>;
  tableOperate?: Array<Operate>;
  tableOperateWidth: string | number;
  tableData: Array<AnyObject>;
  rowKey?:string;
  tableName?:string;
  [key: string]: any
}

export interface PageInfo {
  curPage:number;
  pageSize:number;
  total:number;
  curPageChange:Function;
  layout:string;
}