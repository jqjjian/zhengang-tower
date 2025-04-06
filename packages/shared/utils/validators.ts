/**
 * 验证电子邮件地址
 * @param email 电子邮件地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return pattern.test(email);
}

/**
 * 验证手机号码（中国大陆）
 * @param phone 手机号码
 * @returns 是否有效
 */
export function isValidChinesePhone(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phone);
}

/**
 * 验证身份证号码（中国大陆）
 * @param idCard 身份证号码
 * @returns 是否有效
 */
export function isValidChineseIDCard(idCard: string): boolean {
  const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return pattern.test(idCard);
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 是否有效
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * 至少8位，包含大小写字母和数字
 * @param password 密码
 * @returns 是否有效
 */
export function isStrongPassword(password: string): boolean {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return pattern.test(password);
}

/**
 * 验证非空
 * @param value 值
 * @returns 是否非空
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * 验证数字范围
 * @param value 数字值
 * @param min 最小值
 * @param max 最大值
 * @returns 是否在范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
} 