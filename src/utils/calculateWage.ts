import type { IncomeInput, TimeCostInput, ExpenseInput, HourlyWageResult, IndustryComparison } from '../types';

// 行业平均时薪数据（参考市场数据）
export const INDUSTRY_DATA: { id: string; name: string; averageHourlyWage: number }[] = [
  { id: 'internet', name: '互联网/IT', averageHourlyWage: 120 },
  { id: 'finance', name: '金融', averageHourlyWage: 150 },
  { id: 'manufacturing', name: '制造业', averageHourlyWage: 60 },
  { id: 'service', name: '服务业', averageHourlyWage: 45 },
  { id: 'education', name: '教育', averageHourlyWage: 70 },
  { id: 'medical', name: '医疗', averageHourlyWage: 130 },
  { id: 'media', name: '媒体/广告', averageHourlyWage: 85 },
  { id: 'real_estate', name: '房地产', averageHourlyWage: 95 },
  { id: 'retail', name: '零售', averageHourlyWage: 40 },
  { id: 'transport', name: '物流/运输', averageHourlyWage: 50 },
  { id: 'construction', name: '建筑', averageHourlyWage: 55 },
  { id: 'other', name: '其他', averageHourlyWage: 65 },
];

/**
  * 计算各种薪资相关数值
  */
export function calculateSalaryBreakdown(input: IncomeInput) {
  const { monthlySalary, bonus, socialSecurityRate, housingFundRate } = input;

  // 年薪
  const grossAnnualSalary = monthlySalary * 12;

  // 年终奖（按2个月计算，如果没有则为0）
  const annualBonus = bonus || 0;

  // 总收入（税前）
  const totalAnnualIncome = grossAnnualSalary + annualBonus;

  // 五险一金个人缴纳部分
  const socialSecurity = monthlySalary * socialSecurityRate * 12;
  const housingFund = monthlySalary * housingFundRate * 12;

  // 到手工资
  const takeHomePay = monthlySalary - (monthlySalary * (socialSecurityRate + housingFundRate));

  return {
    grossAnnualSalary,
    annualBonus,
    totalAnnualIncome,
    socialSecurity,
    housingFund,
    takeHomePay,
    totalMonthlyDeduction: monthlySalary * (socialSecurityRate + housingFundRate)
  };
}

/**
 * 计算年总工作相关时间（小时）
 */
export function calculateTotalYearlyWorkHours(input: TimeCostInput): number {
  const { dailyHours, workDaysPerWeek, commuteTimeOneWay, averageOvertime } = input;

  // 每日总工作时间（工作时长 + 加班 + 通勤）
  const dailyWorkRelatedHours = dailyHours + averageOvertime + (commuteTimeOneWay / 60) * 2;

  // 年总工作相关时间
  const totalYearlyWorkHours = dailyWorkRelatedHours * workDaysPerWeek * 52;

  return totalYearlyWorkHours;
}

/**
 * 计算年隐形支出
 */
export function calculateTotalYearlyExpenses(input: ExpenseInput): number {
  const { monthlyCommuteCost, monthlyMealCost, otherExpenses } = input;

  const otherExpensesTotal = otherExpenses.reduce((sum, item) => sum + item.amount, 0);

  const totalMonthlyExpenses = monthlyCommuteCost + monthlyMealCost + otherExpensesTotal;

  return totalMonthlyExpenses * 12;
}

/**
 * 计算时薪
 * 真实时薪 = (年收入 - 年隐形支出) / 年总工作相关时间
 */
export function calculateRealHourlyWage(
  income: IncomeInput,
  timeCost: TimeCostInput,
  expenses: ExpenseInput
): HourlyWageResult {
  const { takeHomePay } = calculateSalaryBreakdown(income);
  const totalYearlyWorkHours = calculateTotalYearlyWorkHours(timeCost);
  const totalYearlyExpenses = calculateTotalYearlyExpenses(expenses);

  // 年到手收入
  const yearlyTakeHome = takeHomePay * 12;

  // 真实时薪
  const realHourlyWage = (yearlyTakeHome - totalYearlyExpenses) / totalYearlyWorkHours;

  // 名义时薪（不考虑隐形支出）
  const nominalHourlyWage = yearlyTakeHome / totalYearlyWorkHours;

  return {
    real: Math.round(realHourlyWage * 100) / 100,
    nominal: Math.round(nominalHourlyWage * 100) / 100,
    takeHomePay,
    totalYearlyWorkHours,
    totalYearlyExpenses,
    yearlyTakeHome,
    nominalHourlyWage: Math.round(nominalHourlyWage * 100) / 100
  };
}

/**
 * 计算行业对比
 */
export function calculateIndustryComparison(
  realHourlyWage: number,
  industryId: string
): IndustryComparison {
  const industry = INDUSTRY_DATA.find(i => i.id === industryId) || INDUSTRY_DATA[INDUSTRY_DATA.length - 1];

  const diffPercentage = ((realHourlyWage - industry.averageHourlyWage) / industry.averageHourlyWage) * 100;

  let rating: '优秀' | '良好' | '一般' | '偏低' = '一般';
  if (diffPercentage >= 30) {
    rating = '优秀';
  } else if (diffPercentage >= 10) {
    rating = '良好';
  } else if (diffPercentage >= -10) {
    rating = '一般';
  } else {
    rating = '偏低';
  }

  const diffText = diffPercentage >= 0
    ? `高于行业平均${Math.abs(diffPercentage).toFixed(1)}%`
    : `低于行业平均${Math.abs(diffPercentage).toFixed(1)}%`;

  return {
    industry: industry.name,
    averageHourlyWage: industry.averageHourlyWage,
    diffPercentage: Math.round(diffPercentage * 100) / 100,
    rating,
    diffText
  };
}

/**
 * 获取评价语
 */
export function getRatingMessage(realHourlyWage: number): string {
  if (realHourlyWage >= 100) {
    return '你的时薪非常可观，简直是时间印钞机！💰';
  } else if (realHourlyWage >= 60) {
    return '你的时薪处于较高水平，工作价值得到充分体现！🌟';
  } else if (realHourlyWage >= 40) {
    return '你的时薪属于正常水平，继续加油提升自己！💪';
  } else if (realHourlyWage >= 20) {
    return '你的时薪还有提升空间，可以考虑优化时间投入产出比。📚';
  } else {
    return '你的时薪较低，可能需要重新评估当前的工作安排了。🤔';
  }
}
