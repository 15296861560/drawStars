import { resolveAreaName } from '../data/areaCode'
import type { IdCardAnalysisResult } from '../types'

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

const ID18_REG =
  /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
const ID15_REG =
  /^[1-9]\d{5}\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}$/

function emptyResult(message: string, idNumber = ''): IdCardAnalysisResult {
  return {
    valid: false,
    message,
    idNumber,
    addressCode: '',
    address: '',
    birthday: '',
    age: null,
    gender: '',
    sequentialCode: '',
    checkCode: '',
    checkPassed: false
  }
}

function calcCheckCode(body17: string): string {
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number(body17[i]) * WEIGHTS[i]
  }
  return CHECK_CODES[sum % 11]
}

function calcAge(birthday: string): number | null {
  const m = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const md = now.getMonth() - birth.getMonth()
  if (md < 0 || (md === 0 && now.getDate() < birth.getDate())) age -= 1
  return age
}

function to18(id15: string): string {
  const body17 = id15.slice(0, 6) + '19' + id15.slice(6)
  return body17 + calcCheckCode(body17)
}

/**
 * Analyze Chinese ID card number (15 / 18 digits).
 * Pure client-side; area names use built-in GB/T 2260 subset.
 */
export function analyzeIdCard(raw: string): IdCardAnalysisResult {
  const idNumber = String(raw || '')
    .trim()
    .toUpperCase()
  if (!idNumber) return emptyResult('请输入身份证号')

  let normalized = idNumber
  if (ID15_REG.test(idNumber)) {
    normalized = to18(idNumber)
  } else if (!ID18_REG.test(idNumber)) {
    return emptyResult('身份证号格式不正确', idNumber)
  }

  const addressCode = normalized.slice(0, 6)
  const year = normalized.slice(6, 10)
  const month = normalized.slice(10, 12)
  const day = normalized.slice(12, 14)
  const birthday = `${year}-${month}-${day}`
  const birthDate = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    Number.isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() !== Number(year) ||
    birthDate.getMonth() + 1 !== Number(month) ||
    birthDate.getDate() !== Number(day)
  ) {
    return emptyResult('出生日期无效', idNumber)
  }

  const sequentialCode = normalized.slice(14, 17)
  const checkCode = normalized.slice(17)
  const expected = calcCheckCode(normalized.slice(0, 17))
  const checkPassed = checkCode === expected
  const genderCode = Number(sequentialCode[2])
  const gender = genderCode % 2 === 0 ? '女' : '男'

  return {
    valid: checkPassed,
    message: checkPassed ? '校验通过' : `校验位不匹配（应为 ${expected}）`,
    idNumber,
    addressCode,
    address: resolveAreaName(addressCode),
    birthday,
    age: calcAge(birthday),
    gender,
    sequentialCode,
    checkCode,
    checkPassed
  }
}
