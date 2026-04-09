import type { IncomeInput, TimeCostInput, ExpenseInput, ExampleData } from '../types';

// 典型互联网打工人示例数据
export const EXAMPLE_DATA: ExampleData = {
  income: {
    monthlySalary: 15000,
    bonus: 30000, // 2个月年终奖
    socialSecurityRate: 0.105, // 10.5%社保
    housingFundRate: 0.12 // 12%公积金
  },
  timeCost: {
    dailyHours: 9,
    workDaysPerWeek: 5,
    commuteTimeOneWay: 60, // 1小时通勤
    averageOvertime: 2
  },
  expenses: {
    monthlyCommuteCost: 500,
    monthlyMealCost: 800,
    otherExpenses: [
      { id: '1', name: '工作服装', amount: 200 },
      { id: '2', name: '学习提升', amount: 300 }
    ]
  }
};

// 默认输入值
export const DEFAULT_INCOME: IncomeInput = {
  monthlySalary: 10000,
  bonus: 0,
  socialSecurityRate: 0.105,
  housingFundRate: 0.12
};

export const DEFAULT_TIME_COST: TimeCostInput = {
  dailyHours: 8,
  workDaysPerWeek: 5,
  commuteTimeOneWay: 60,
  averageOvertime: 0
};

export const DEFAULT_EXPENSES: ExpenseInput = {
  monthlyCommuteCost: 500,
  monthlyMealCost: 800,
  otherExpenses: []
};
