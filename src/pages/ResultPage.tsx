import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as echarts from 'echarts';
import { FormLayout, SelectField } from '../components/form-components';
import type { IncomeInput, TimeCostInput, ExpenseInput } from '../types';
import { useIncome } from '../hooks/useData';
import { useTimeCost } from '../hooks/useData';
import { useExpenses } from '../hooks/useData';
import {
  calculateSalaryBreakdown,
  calculateTotalYearlyWorkHours,
  calculateTotalYearlyExpenses,
  calculateRealHourlyWage,
  calculateIndustryComparison,
  getRatingMessage
} from '../utils/calculateWage';
import { INDUSTRY_DATA } from '../utils/calculateWage';
import { generateAnalysisReport, AnalysisResult } from '../utils/aiAnalysis';

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function ResultPage() {
  const navigate = useNavigate();
  const { income, loadFromStorage: loadIncome } = useIncome();
  const { timeCost, loadFromStorage: loadTimeCost } = useTimeCost();
  const { expenses, loadFromStorage: loadExpenses } = useExpenses();

  const [selectedIndustry, setSelectedIndustry] = useState('internet');
  const [result, setResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // 加载存储的数据
  useEffect(() => {
    loadIncome();
    loadTimeCost();
    loadExpenses();
  }, []);

  // 计算结果
  useEffect(() => {
    const calculate = debounce(() => {
      setLoading(true);

      // 使用小延迟让UI更新
      setTimeout(() => {
        const wageResult = calculateRealHourlyWage(income, timeCost, expenses);
        const industryComparison = calculateIndustryComparison(wageResult.real, selectedIndustry);

        const totalOtherExpenses = expenses.otherExpenses.reduce((sum, item) => sum + item.amount, 0);
        const monthlyExpenses = expenses.monthlyCommuteCost + expenses.monthlyMealCost + totalOtherExpenses;

        setResult({
          wageResult,
          industryComparison,
          monthlyExpenses,
          totalOtherExpenses,
          breakdown: calculateSalaryBreakdown(income)
        });

        setLoading(false);
      }, 100);
    }, 300);

    calculate();
  }, [income, timeCost, expenses, selectedIndustry]);

  // 读取分析结果（当结果计算完成后）
  useEffect(() => {
    if (result && !analysis) {
      fetchAnalysis();
    }
  }, [result]);

  const fetchAnalysis = async () => {
    if (!result) return;

    setAnalysisLoading(true);
    try {
      const data = {
        monthlySalary: income.monthlySalary,
        bonus: income.bonus || 0,
        takeHomePay: result.breakdown.takeHomePay,
        yearlyTakeHome: result.wageResult.yearlyTakeHome,
        realHourlyWage: result.wageResult.real,
        nominalHourlyWage: result.wageResult.nominal,
        totalYearlyWorkHours: result.wageResult.totalYearlyWorkHours,
        dailyHours: timeCost.dailyHours,
        averageOvertime: timeCost.averageOvertime,
        commuteTimeOneWay: timeCost.commuteTimeOneWay,
        monthlyCommuteCost: expenses.monthlyCommuteCost,
        monthlyMealCost: expenses.monthlyMealCost,
        otherExpensesTotal: expenses.otherExpenses.reduce((sum, item) => sum + item.amount, 0),
        industry: result.industryComparison.industry,
        industryAverage: result.industryComparison.averageHourlyWage,
        diffPercentage: result.industryComparison.diffPercentage,
      };

      const analysisData = await generateAnalysisReport(data);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('获取分析报告失败:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 初始化ECharts图表
  useEffect(() => {
    if (!result) return;

    // 收入构成饼图
    const incomeChart = echarts.init(document.getElementById('income-chart')!);
    const incomeOption = {
      title: { text: '收入构成', left: 'center', top: 10 },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: [
          { value: result.breakdown.socialSecurity, name: '五险一金' },
          { value: result.wageResult.takeHomePay * 12 - result.totalYearlyExpenses, name: '到手净收入' }
        ],
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    };
    incomeChart.setOption(incomeOption);

    // 时间分配饼图
    const timeChart = echarts.init(document.getElementById('time-chart')!);
    const workHoursPerDay = timeCost.dailyHours + timeCost.averageOvertime;
    const commuteHoursPerDay = (timeCost.commuteTimeOneWay / 60) * 2;
    const totalDailyHours = workHoursPerDay + commuteHoursPerDay;

    const timeOption = {
      title: { text: '每日时间分配', left: 'center', top: 10 },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: [
          { value: workHoursPerDay, name: '工作时间' },
          { value: commuteHoursPerDay, name: '通勤时间' }
        ],
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    };
    timeChart.setOption(timeOption);

    // 时薪对比图
    const wageChart = echarts.init(document.getElementById('wage-chart')!);
    const wageOption = {
      title: { text: '时薪对比', left: 'center', top: 10 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['名义时薪', '真实时薪']
      },
      yAxis: {
        type: 'value',
        name: '元/小时'
      },
      series: [{
        type: 'bar',
        data: [result.wageResult.nominal, result.wageResult.real],
        itemStyle: {
          color: function(params: any) {
            return params.dataIndex === 1 ? '#4F46E5' : '#9CA3AF';
          }
        }
      }]
    };
    wageChart.setOption(wageOption);

    return () => {
      incomeChart.dispose();
      timeChart.dispose();
      wageChart.dispose();
    };
  }, [result, timeCost]);

  const handleBack = () => {
    navigate('/expenses');
  };

  const handleReset = () => {
    if (window.confirm('确定要清空所有数据吗？')) {
      localStorage.removeItem('salary_calculator_data');
      window.location.reload();
    }
  };

  const copyToClipboard = () => {
    if (!result) return;

    const text = `📊 打工人时薪测算结果

💰 名义时薪：¥${result.wageResult.nominal.toFixed(2)}/小时
💰 真实时薪：¥${result.wageResult.real.toFixed(2)}/小时

📈 年收入：¥${result.wageResult.yearlyTakeHome.toFixed(2)}
💸 年隐形支出：¥${result.wageResult.totalYearlyExpenses.toFixed(2)}
⏱️  年总工时：${result.wageResult.totalYearlyWorkHours.toFixed(0)}小时

🎯 行业对比：${result.industryComparison.diffText}
⭐ 评价：${getRatingMessage(result.wageResult.real)}`;

    navigator.clipboard.writeText(text).then(() => {
      alert('结果已复制到剪贴板！');
    });
  };

  if (!result) {
    return (
      <div className="page-container">
        <FormLayout title="计算中..." description="正在处理您的数据...">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          <p className="text-center">正在计算您的真实时薪...</p>
        </FormLayout>
      </div>
    );
  }

  return (
    <div className="page-container result-page">
      <div className="result-header">
        <h2 className="result-title">📊 时薪测算结果</h2>
        <div className="result-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleBack}>
            ← 修改数据
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            重置数据
          </button>
          <button className="btn btn-primary btn-sm" onClick={copyToClipboard}>
            {'📋'} 复制结果
          </button>
        </div>
      </div>

      <div className="result-grid">
        {/* 真实时薪卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card highlight-card"
        >
          <h3 className="card-title">真实时薪</h3>
          <div className="hourly-wage-display">
            <span className="wage-symbol">¥</span>
            <span className="wage-amount">{result.wageResult.real.toFixed(2)}</span>
            <span className="wage-unit">/小时</span>
          </div>
          <p className="rating-message">{getRatingMessage(result.wageResult.real)}</p>
          <div className="wage-compare">
            <span className="compare-label">名义时薪</span>
            <span className="compare-value">¥{result.wageResult.nominal.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* 关键数据卡片 */}
        <div className="result-details">
          <div className="card">
            <h3 className="card-title">年收入概况</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">月薪</span>
                <span className="detail-value">¥{result.breakdown.takeHomePay.toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">年终奖</span>
                <span className="detail-value">¥{result.breakdown.annualBonus.toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">五险一金</span>
                <span className="detail-value">¥{result.breakdown.socialSecurity.toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">年到手收入</span>
                <span className="detail-value highlight">¥{result.wageResult.yearlyTakeHome.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">时间成本</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">每日工作</span>
                <span className="detail-value">
                  {timeCost.dailyHours + timeCost.averageOvertime}小时
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">每周工作</span>
                <span className="detail-value">{timeCost.workDaysPerWeek}天</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">通勤时间</span>
                <span className="detail-value">{timeCost.commuteTimeOneWay}分钟单程</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">年总工时</span>
                <span className="detail-value highlight">{result.wageResult.totalYearlyWorkHours.toFixed(0)}小时</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">隐形支出</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">每月通勤</span>
                <span className="detail-value">¥{expenses.monthlyCommuteCost.toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">每月餐费</span>
                <span className="detail-value">¥{expenses.monthlyMealCost.toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">其他支出</span>
                <span className="detail-value">¥{expenses.otherExpenses.reduce((sum, item) => sum + item.amount, 0).toFixed(0)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">年总支出</span>
                <span className="detail-value highlight" style={{ color: '#EF4444' }}>
                  ¥{result.wageResult.totalYearlyExpenses.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 行业对比卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="card-title">行业对比</h3>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">选择行业</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="form-input"
            >
              {INDUSTRY_DATA.map(industry => (
                <option key={industry.id} value={industry.id}>
                  {industry.name} (平均¥{industry.averageHourlyWage}/小时)
                </option>
              ))}
            </select>
          </div>

          <div className="industry-compare">
            <div className="compare-item">
              <span className="compare-label">您的真实时薪</span>
              <span className="compare-value large">{result.wageResult.real.toFixed(2)}</span>
            </div>
            <div className="compare-item">
              <span className="compare-label">{result.industryComparison.industry}平均</span>
              <span className="compare-value large">{result.industryComparison.averageHourlyWage}</span>
            </div>
          </div>

          <div className={`rating-badge ${result.industryComparison.rating}`}>
            {result.industryComparison.rating}
          </div>
          <p className="compare-text">{result.industryComparison.diffText}</p>
        </motion.div>

        {/* 图表区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card charts-container"
        >
          <h3 className="card-title">数据可视化</h3>
          <div className="charts-grid">
            <div id="income-chart" style={{ width: '100%', height: '250px' }}></div>
            <div id="time-chart" style={{ width: '100%', height: '250px' }}></div>
            <div id="wage-chart" style={{ width: '100%', height: '250px' }}></div>
          </div>
        </motion.div>

        {/* 简单说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card info-card"
        >
          <h3 className="card-title">💡 计算说明</h3>
          <div className="info-content">
            <p><strong>真实时薪计算公式：</strong></p>
            <p className="formula">
              (年到手收入 - 年隐形支出) ÷ 年总工作相关时间
            </p>
            <p><strong>计算内容包括：</strong></p>
            <ul>
              <li>✓ 工作时长和加班时间</li>
              <li>✓ 往返通勤时间</li>
              <li>✓ 五险一金扣除</li>
              <li>✓ 工作相关支出（通勤、餐费等）</li>
            </ul>
          </div>
        </motion.div>

        {/* AI 解读报告 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="card-title">✨ AI 职场解读</h3>
          {analysisLoading ? (
            <div className="analysis-loading">
              <div className="loading-spinner">
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
              </div>
              <p className="text-center">AI 正在为你生成独家解读...</p>
            </div>
          ) : analysis ? (
            <div className="ai-analysis-content">
              {/* 工资情况描述 */}
              <div className="analysis-section">
                <h4>💰 工资情况</h4>
                <p className="analysis-text">{analysis.salaryDescription}</p>
              </div>

              {/* 同行业对比 */}
              <div className="analysis-section">
                <h4>📊 同行业对比</h4>
                <p className="analysis-text">{analysis.industryComparison}</p>
              </div>

              {/* 未来增长空间 */}
              <div className="analysis-section">
                <h4>🚀 未来增长空间</h4>
                <p className="analysis-text">{analysis.growthPotential}</p>
              </div>

              {/* 建议 */}
              <div className="analysis-section">
                <h4>💡 小王的建议</h4>
                <ul className="suggestions-list">
                  {analysis.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx}> {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="analysis-empty">
              <p>数据已就绪，点击「生成解读」获取 AI 分析报告</p>
              <button
                className="btn btn-primary"
                onClick={fetchAnalysis}
                style={{ marginTop: '16px' }}
              >
                🤖 生成解读报告
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ResultPage;
