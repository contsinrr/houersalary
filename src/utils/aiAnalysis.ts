// 大模型 API 配置
interface AnalysisRequest {
  monthlySalary: number;
  bonus: number;
  takeHomePay: number;
  yearlyTakeHome: number;
  realHourlyWage: number;
  nominalHourlyWage: number;
  totalYearlyWorkHours: number;
  dailyHours: number;
  averageOvertime: number;
  commuteTimeOneWay: number;
  monthlyCommuteCost: number;
  monthlyMealCost: number;
  otherExpensesTotal: number;
  industry: string;
  industryAverage: number;
  diffPercentage: number;
}

// 分析结果
interface AnalysisResult {
  salaryDescription: string;
  industryComparison: string;
  growthPotential: string;
  suggestions: string[];
}

/**
 * 调用大模型生成幽默风格的解读报告
 */
export async function generateAnalysisReport(data: AnalysisRequest): Promise<AnalysisResult> {
  const prompt = `
你是一个幽默风趣的职场分析师，专门为打工人提供薪资解读。请根据以下数据生成一份搞笑的解读报告：

**用户数据：**
- 月薪：¥${data.monthlySalary}
- 年终奖：¥${data.bonus}
- 年到手收入：¥${Math.round(data.yearlyTakeHome)}
- 真实时薪：¥${data.realHourlyWage}/小时
- 名义时薪：¥${data.nominalHourlyWage}/小时
- 年总工时：${Math.round(data.totalYearlyWorkHours)}小时
- 每日工作：${data.dailyHours}小时
- 平均加班：${data.averageOvertime}小时
- 单程通勤：${data.commuteTimeOneWay}分钟
- 每月通勤费：¥${data.monthlyCommuteCost}
- 每月餐费：¥${data.monthlyMealCost}
- 其他支出：¥${Math.round(data.otherExpensesTotal)}
- 所在行业：${data.industry}
- 行业平均时薪：¥${data.industryAverage}
- 时薪差距：${data.diffPercentage >= 0 ? '+' : ''}${data.diffPercentage}%

**要求：**
1. 风格幽默搞笑，使用网络流行语和段子
2. 可以适当夸张和调侃，但要保持专业性
3. 使用emoji增加趣味性
4. 四个部分都要包含：
   - 工资情况描述：调侃用户的收入水平
   - 同行业对比：和行业平均的对比
   - 未来增长空间：职业发展建议
   - 建议：具体的行动建议
5. 每部分用轻松的语气，比如"打工人"、"打鸡血"、"清醒点"等语气词
6. 加入一些职场梗，比如"福报"、"996"、"007"等

请以JSON格式返回结果：
{
  "salaryDescription": "段落内容",
  "industryComparison": "段落内容",
  "growthPotential": "段落内容",
  "suggestions": ["建议1", "建议2", "建议3", "建议4"]
}
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer sk-250fb50eea74475a97a37a9e4f8538a1`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': '打工人时薪测算',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: '你是一个幽默风趣的职场分析师，专门为打工人提供薪资解读。请使用中文回复。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    // 解析 JSON（可能包含代码块标记）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 如果解析失败，返回默认格式
    return {
      salaryDescription: content.substring(0, 500),
      industryComparison: '行业对比数据见页面上方详情',
      growthPotential: '持续提升技能是核心竞争力',
      suggestions: ['好好工作', '注意休息', '合理规划财务', '保持学习'],
    };
  } catch (error) {
    console.error('生成分析报告失败:', error);
    return {
      salaryDescription: ` failed to generate report: ${error.message}`,
      industryComparison: '请稍后重试',
      growthPotential: '建议优先解决网络问题',
      suggestions: ['刷新页面', '检查网络连接', '稍后重试'],
    };
  }
}
