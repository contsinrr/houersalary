// 收入相关类型
export interface IncomeInput {
  monthlySalary: number;
  bonus: number;
  socialSecurityRate: number;
  housingFundRate: number;
}

// 时间成本相关类型
export interface TimeCostInput {
  dailyHours: number;
  workDaysPerWeek: number;
  commuteTimeOneWay: number;
  averageOvertime: number;
}

// 隐性支出相关类型
export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseInput {
  monthlyCommuteCost: number;
  monthlyMealCost: number;
  otherExpenses: ExpenseItem[];
}

// 计算结果类型
export interface CalculationResult {
  monthlySalary: number;
  bonus: number;
  socialSecurity: number;
  housingFund: number;
  takeHomePay: number;
  totalMonthlyExpenses: number;
  totalYearlyExpenses: number;
  nominalHourlyWage: number;
  realHourlyWage: number;
  totalYearlyWorkHours: number;
  totalYearlyIncome: number;
  industryComparison: IndustryComparison;
}

// 行业对比类型
export interface IndustryComparison {
  industry: string;
  averageHourlyWage: number;
  diffPercentage: number;
  rating: '优秀' | '良好' | '一般' | '偏低';
  diffText: string;
}

// 行业数据类型
export interface IndustryData {
  id: string;
  name: string;
  averageHourlyWage: number;
}

// 示例数据类型
export interface ExampleData {
  income: IncomeInput;
  timeCost: TimeCostInput;
  expenses: ExpenseInput;
}

// 时薪计算结果
export interface HourlyWageResult {
  real: number;
  nominal: number;
  takeHomePay: number;
  totalYearlyWorkHours: number;
  totalYearlyExpenses: number;
  yearlyTakeHome: number;
  nominalHourlyWage: number;
}
