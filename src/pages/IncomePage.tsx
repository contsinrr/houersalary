import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FormLayout, NumberField, SelectField } from '../components/form-components';
import type { IncomeInput } from '../types';
import { useIncome } from '../hooks/useData';

const SOCIAL_SECURITY_OPTIONS = [
  { value: 0.08, label: '8% (标准比例)' },
  { value: 0.105, label: '10.5% (部分城市)' },
  { value: 0.12, label: '12% (高比例)' },
];

const HOUSING_FUND_OPTIONS = [
  { value: 0.05, label: '5% (标准比例)' },
  { value: 0.10, label: '10% (常见比例)' },
  { value: 0.12, label: '12% (高比例)' },
  { value: 0.15, label: '15% (部分城市)' },
];

function IncomePage() {
  const navigate = useNavigate();
  const { income, updateIncome, loadFromStorage } = useIncome();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载存储的数据
  useEffect(() => {
    loadFromStorage();
  }, []);

  const validate = (data: IncomeInput): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.monthlySalary || data.monthlySalary < 0) {
      newErrors.monthlySalary = '请输入有效的月薪';
    }

    if (data.bonus && data.bonus < 0) {
      newErrors.bonus = '年终奖不能为负数';
    }

    return newErrors;
  };

  const handleNext = () => {
    const validation = validate(income);
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      navigate('/time-cost');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value ? parseFloat(value) : 0;
    updateIncome({ [name]: numValue });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRateChange = (name: string, value: number) => {
    updateIncome({ [name]: value });
  };

  return (
    <div className="page-container">
      <div className="progress-indicator">
        <div className="progress-step active">
          <span className="step-number">1</span>
          <span className="step-text">收入信息</span>
        </div>
        <div className="progress-step">
          <span className="step-number">2</span>
          <span className="step-text">时间成本</span>
        </div>
        <div className="progress-step">
          <span className="step-number">3</span>
          <span className="step-text">隐形支出</span>
        </div>
        <div className="progress-step">
          <span className="step-number">4</span>
          <span className="step-text">结果展示</span>
        </div>
      </div>

      <FormLayout title="薪资收入信息" description="请输入您的薪资相关数据，我们将基于这些信息计算您的时薪">
        <div className="form-section">
          <NumberField
            label="月薪"
            name="monthlySalary"
            value={income.monthlySalary}
            onChange={handleIncomeChange}
            placeholder="请输入月薪"
            required
            min={0}
            step={100}
            error={errors.monthlySalary}
          />

          <NumberField
            label="年终奖"
            name="bonus"
            value={income.bonus || 0}
            onChange={handleIncomeChange}
            placeholder="请输入年终奖（可选）"
            min={0}
            step={100}
            error={errors.bonus}
          />
          <p className="form-hint">请输入全年预计获得的年终奖总额</p>
        </div>

        <div className="form-section">
          <h3 className="form-subtitle">五险一金缴纳比例</h3>
          <p className="form-hint">通常社保比例为10.5%，公积金比例为5%-12%</p>

          <div className="two-column">
            <SelectField
              label="社保缴纳比例"
              name="socialSecurityRate"
              value={income.socialSecurityRate}
              onChange={(e) => handleRateChange('socialSecurityRate', parseFloat(e.target.value))}
              options={SOCIAL_SECURITY_OPTIONS}
            />

            <SelectField
              label="公积金缴纳比例"
              name="housingFundRate"
              value={income.housingFundRate}
              onChange={(e) => handleRateChange('housingFundRate', parseFloat(e.target.value))}
              options={HOUSING_FUND_OPTIONS}
            />
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

export default IncomePage;
