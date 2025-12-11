import dayjs from 'dayjs';

/**
 * 计算鹦鹉的年龄
 * @param birthDate 出生日期字符串
 * @returns 年龄描述字符串，如 "3个月15天" 或 "1年2个月"
 */
export function calculateAge(birthDate: string | null): string {
  if (!birthDate) {
    return '-';
  }

  const birth = dayjs(birthDate);
  const now = dayjs();

  if (!birth.isValid()) {
    return '-';
  }

  // 计算总天数
  const totalDays = now.diff(birth, 'day');

  if (totalDays < 0) {
    return '-';
  }

  // 计算年、月、天
  const years = now.diff(birth, 'year');
  const months = now.diff(birth.add(years, 'year'), 'month');
  const days = now.diff(birth.add(years, 'year').add(months, 'month'), 'day');

  // 格式化输出
  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years}年`);
  }
  if (months > 0) {
    parts.push(`${months}个月`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days}天`);
  }

  return parts.join('');
}

/**
 * 计算鹦鹉的年龄（以天为单位）
 * @param birthDate 出生日期字符串
 * @returns 年龄天数
 */
export function calculateAgeDays(birthDate: string | null): number {
  if (!birthDate) {
    return 0;
  }

  const birth = dayjs(birthDate);
  const now = dayjs();

  if (!birth.isValid()) {
    return 0;
  }

  const days = now.diff(birth, 'day');
  return days > 0 ? days : 0;
}

/**
 * 判断鹦鹉是否达到种鸟年龄
 * @param birthDate 出生日期字符串
 * @param minAgeDays 最小年龄天数（默认365天，即1年）
 * @returns 是否达到种鸟年龄
 */
export function isBreedingAge(birthDate: string | null, minAgeDays: number = 365): boolean {
  return calculateAgeDays(birthDate) >= minAgeDays;
}
