import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FormLayout, NumberField } from '../components/form-components';
import type { ExpenseInput, ExpenseItem } from '../types';
import { useExpenses } from '../hooks/useData';
import { v4 as uuidv4 } from 'uuid';

function ExpensesPage() {
  const navigate = useNavigate();
  const { expenses, updateExpenses, addExpenseItem, removeExpenseItem, loadFromStorage } = useExpenses();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // 加载存储的数据
  useEffect(() => {
    loadFromStorage();
  }, []);

  const validate = (data: ExpenseInput): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (data.monthlyCommuteCost && data.monthlyCommuteCost < 0) {
      newErrors.monthlyCommuteCost = '通勤费用不能为负数';
    }

    if (data.monthlyMealCost && data.monthlyMealCost < 0) {
      newErrors.monthlyMealCost = '工作餐费用不能为负数';
    }

    return newErrors;
  };

  const handleNext = () => {
    const validation = validate(expenses);
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      navigate('/result');
    }
  };

  const handleBack = () => {
    navigate('/time-cost');
  };

  const handleFixedExpenseChange = (name: keyof ExpenseInput, value: number) => {
    updateExpenses({ [name]: value });
  };

  const handleAddExpense = () => {
    if (!newExpenseName || !newExpenseAmount) return;

    const newExpense: ExpenseItem = {
      id: uuidv4(),
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount)
    };

    addExpenseItem(newExpense);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const handleRemoveExpense = (id: string) => {
    removeExpenseItem(id);
  };

  return (
    <div className="page-container">
      <div className="progress-indicator">
        <div className="progress-step completed">
          <span className="step-number">1</span>
          <span className="step-text">收入信息</span>
        </div>
        <div className="progress-step completed">
          <span className="step-number">2</span>
          <span className="step-text">时间成本</span>
        </div>
        <div className="progress-step active">
          <span className="step-number">3</span>
          <span className="step-text">隐形支出</span>
        </div>
        <div className="progress-step">
          <span className="step-number">4</span>
          <span className="step-text">结果展示</span>
        </div>
      </div>

      <FormLayout title="隐形支出信息" description="请输入与工作相关的隐形支出，这些都会影响您的真实时薪">
        <div className="form-section">
          <NumberField
            label="每月通勤费用"
            name="monthlyCommuteCost"
            value={expenses.monthlyCommuteCost || 0}
            onChange={(e) => handleFixedExpenseChange('monthlyCommuteCost', parseFloat(e.target.value) || 0)}
            placeholder="例如：500"
            min={0}
            step={10}
            suffix="元"
            error={errors.monthlyCommuteCost}
          />
          <p className="form-hint">包括地铁、公交、打车等交通费用</p>
        </div>

        <div className="form-section">
          <NumberField
            label="每月工作餐费用"
            name="monthlyMealCost"
            value={expenses.monthlyMealCost || 0}
            onChange={(e) => handleFixedExpenseChange('monthlyMealCost', parseFloat(e.target.value) || 0)}
            placeholder="例如：800"
            min={0}
            step={10}
            suffix="元"
            error={errors.monthlyMealCost}
          />
          <p className="form-hint">包括工作餐、零食或咖啡等费用</p>
        </div>

        <div className="form-section">
          <h3 className="form-subtitle">其他支出项目</h3>
          <p className="form-hint">添加与工作相关的其他支出</p>

          <div className="dynamic-form-entry">
            <input
              type="text"
              placeholder="支出项目名称"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="金额"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              className="form-input"
              min={0}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddExpense}
              disabled={!newExpenseName || !newExpenseAmount}
            >
              添加
            </button>
          </div>

          {expenses.otherExpenses.length > 0 && (
            <div className="expense-list">
              {expenses.otherExpenses.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="expense-item"
                >
                  <span className="expense-name">{item.name}</span>
                  <span className="expense-amount">¥{item.amount}</span>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleRemoveExpense(item.id)}
                  >
                    删除
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="form-total">
          <div className="total-row">
            <span>每月总支出：</span>
            <span className="total-amount">
              ¥{(expenses.monthlyCommuteCost + expenses.monthlyMealCost + expenses.otherExpenses.reduce((sum, item) => sum + item.amount, 0)).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← 上一步
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            下一步 →
          </button>
        </div>
      </FormLayout>
    </div>
  );
}

export default ExpensesPage;
