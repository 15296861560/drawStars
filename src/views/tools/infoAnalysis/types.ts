export interface AnalysisToolItem {
  key: string
  path: string
  icon: string
  i18nKey: string
}

export interface IdCardAnalysisResult {
  valid: boolean
  message: string
  idNumber: string
  addressCode: string
  address: string
  birthday: string
  age: number | null
  gender: string
  sequentialCode: string
  checkCode: string
  checkPassed: boolean
}

export interface PhoneLocationResult {
  valid: boolean
  message: string
  phone: string
  province: string
  city: string
  carrier: string
  areaCode: string
  zipCode: string
  source: 'api' | 'local'
}
