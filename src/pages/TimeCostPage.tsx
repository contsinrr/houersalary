import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FormLayout, NumberField, SelectField } from '../components/form-components';
import type { TimeCostInput } from '../types';
import { useTimeCost } from '../hooks/useData';

const WORK_DAYS_OPTIONS = [
  { value: 5, label: '5天/周 (标准工作周)' },
  { value: 6, label: '6天/周 (双休日工作)' },
  { value: 7, label: '7天/周 (7x24工作)' },
];

function TimeCostPage() {
  const navigate = useNavigate();
  const { timeCost, updateTimeCost, loadFromStorage } = useTimeCost();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载存储的数据
  useEffect(() => {
    loadFromStorage();
  }, []);

  const validate = (data: TimeCostInput): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.dailyHours || data.dailyHours < 0 || data.dailyHours > 24) {
      newErrors.dailyHours = '每日工作时长应在0-24小时之间';
    }

    if (!data.workDaysPerWeek || data.workDaysPerWeek < 1 || data.workDaysPerWeek > 7) {
      newErrors.workDaysPerWeek = '每周工作天数应在1-7天之间';
    }

    if (data.commuteTimeOneWay && data.commuteTimeOneWay < 0) {
      newErrors.commuteTimeOneWay = '通勤时间不能为负数';
    }

    if (data.averageOvertime && data.averageOvertime < 0) {
      newErrors.averageOvertime = '加班时长不能为负数';
    }

    return newErrors;
  };

  const handleNext = () => {
    const validation = validate(timeCost);
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      navigate('/expenses');
    }
  };

  const handleBack = () => {
    navigate('/income');
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value ? parseFloat(value) : 0;
    updateTimeCost({ [name]: numValue });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTimeCost({ workDaysPerWeek: parseInt(e.target.value) });
  };

  return (
    <div className="page-container">
      <div className="progress-indicator">
        <div className="progress-step completed">
          <span className="step-number">1</span>
          <span className="step-text">收入信息</span>
        </div>
        <div className="progress-step active">
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

      <FormLayout title="工作时间成本" description="请输入您的工作时间相关数据，包括工作时长、通勤和加班情况">
        <div className="form-section">
          <div className="two-column">
            <NumberField
              label="每日工作时长"
              name="dailyHours"
              value={timeCost.dailyHours}
              onChange={handleTimeChange}
              placeholder="例如：8"
              required
              min={0}
              max={24}
              step={0.5}
              suffix="小时"
              error={errors.dailyHours}
            />

            <NumberField
              label="平均每日加班"
              name="averageOvertime"
              value={timeCost.averageOvertime || 0}
              onChange={handleTimeChange}
              placeholder="例如：2"
              min={0}
              max={12}
              step={0.5}
              suffix="小时"
              error={errors.averageOvertime}
            />
          </div>
          <p className="form-hint">包括法定工作时间和额外加班时间</p>
        </div>

        <div className="form-section">
          <div className="two-column">
            <SelectField
              label="每周工作天数"
              name="workDaysPerWeek"
              value={timeCost.workDaysPerWeek}
              onChange={handleDaysChange}
              options={WORK_DAYS_OPTIONS}
            />

            <NumberField
              label="单程通勤时间"
              name="commuteTimeOneWay"
              value={timeCost.commuteTimeOneWay || 0}
              onChange={handleTimeChange}
              placeholder="例如：60"
              required
              min={0}
              max={300}
              step={5}
              suffix="分钟"
              error={errors.commuteTimeOneWay}
            />
          </div>
          <p className="form-hint">包括去程和返程的总时间</p>
        </div>

        <div className="form-tips">
          <h4>💡 小提示</h4>
          <ul>
            <li>通勤时间按往返计算，双倍计入您的时间成本</li>
            <li>即使不加班，也要考虑路上的时间</li>
            <li>真实时薪应该反映您全部时间投入</li>
          </ul>
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

export default TimeCostPage;
