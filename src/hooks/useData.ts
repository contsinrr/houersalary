import { useState, useEffect, useCallback } from 'react';
import type { IncomeInput, TimeCostInput, ExpenseInput, ExpenseItem } from '../types';
import { DEFAULT_INCOME, DEFAULT_TIME_COST, DEFAULT_EXPENSES } from '../utils/constants';

// localStorage key
const STORAGE_KEY = 'salary_calculator_data';

// 类型守卫：检查数据是否有效
function isValidIncome(data: unknown): data is IncomeInput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'monthlySalary' in data &&
    'socialSecurityRate' in data &&
    'housingFundRate' in data
  );
}

function isValidTimeCost(data: unknown): data is TimeCostInput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'dailyHours' in data &&
    'workDaysPerWeek' in data
  );
}

function isValidExpenses(data: unknown): data is ExpenseInput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'monthlyCommuteCost' in data &&
    'monthlyMealCost' in data
  );
}

/**
 * 自定义Hook：管理收入数据
 */
export function useIncome() {
  const [income, setIncome] = useState<IncomeInput>(DEFAULT_INCOME);

  // 从 localStorage 加载数据
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (isValidIncome(data.income)) {
          setIncome(data.income);
        }
      }
    } catch (error) {
      console.error('Failed to load income from storage:', error);
    }
  }, []);

  // 保存到 localStorage
  const saveToStorage = useCallback((newIncome: IncomeInput) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...existingData,
        income: newIncome
      }));
    } catch (error) {
      console.error('Failed to save income to storage:', error);
    }
  }, []);

  // 更新收入并保存
  const updateIncome = useCallback((newIncome: Partial<IncomeInput>) => {
    setIncome(prev => {
      const updated = { ...prev, ...newIncome };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 重置为默认值
  const resetToDefault = useCallback(() => {
    setIncome(DEFAULT_INCOME);
    saveToStorage(DEFAULT_INCOME);
  }, [saveToStorage]);

  return { income, updateIncome, resetToDefault, loadFromStorage };
}

/**
 * 自定义Hook：管理时间成本数据
 */
export function useTimeCost() {
  const [timeCost, setTimeCost] = useState<TimeCostInput>(DEFAULT_TIME_COST);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (isValidTimeCost(data.timeCost)) {
          setTimeCost(data.timeCost);
        }
      }
    } catch (error) {
      console.error('Failed to load time cost from storage:', error);
    }
  }, []);

  const saveToStorage = useCallback((newTimeCost: TimeCostInput) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...existingData,
        timeCost: newTimeCost
      }));
    } catch (error) {
      console.error('Failed to save time cost to storage:', error);
    }
  }, []);

  const updateTimeCost = useCallback((newTimeCost: Partial<TimeCostInput>) => {
    setTimeCost(prev => {
      const updated = { ...prev, ...newTimeCost };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const resetToDefault = useCallback(() => {
    setTimeCost(DEFAULT_TIME_COST);
    saveToStorage(DEFAULT_TIME_COST);
  }, [saveToStorage]);

  return { timeCost, updateTimeCost, resetToDefault, loadFromStorage };
}

/**
 * 自定义Hook：管理 expenses 数据
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseInput>(DEFAULT_EXPENSES);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (isValidExpenses(data.expenses)) {
          setExpenses(data.expenses);
        }
      }
    } catch (error) {
      console.error('Failed to load expenses from storage:', error);
    }
  }, []);

  const saveToStorage = useCallback((newExpenses: ExpenseInput) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...existingData,
        expenses: newExpenses
      }));
    } catch (error) {
      console.error('Failed to save expenses to storage:', error);
    }
  }, []);

  const updateExpenses = useCallback((newExpenses: Partial<ExpenseInput>) => {
    setExpenses(prev => {
      const updated = { ...prev, ...newExpenses };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 添加支出项目
  const addExpenseItem = useCallback((item: ExpenseItem) => {
    setExpenses(prev => {
      const updated = { ...prev, otherExpenses: [...prev.otherExpenses, item] };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 删除支出项目
  const removeExpenseItem = useCallback((id: string) => {
    setExpenses(prev => {
      const updated = {
        ...prev,
        otherExpenses: prev.otherExpenses.filter(item => item.id !== id)
      };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const resetToDefault = useCallback(() => {
    setExpenses(DEFAULT_EXPENSES);
    saveToStorage(DEFAULT_EXPENSES);
  }, [saveToStorage]);

  return {
    expenses,
    updateExpenses,
    addExpenseItem,
    removeExpenseItem,
    resetToDefault,
    loadFromStorage
  };
}
