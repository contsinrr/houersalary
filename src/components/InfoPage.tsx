import { useState } from 'react';
import { motion } from 'framer-motion';
import { EXAMPLE_DATA } from '../utils/constants';
import { useIncome } from '../hooks/useData';
import { useTimeCost } from '../hooks/useData';
import { useExpenses } from '../hooks/useData';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: '什么是真实时薪？',
    answer: '真实时薪是考虑了所有工作相关的时间成本（包括通勤、加班）和隐形支出（如交通费、餐费）后，计算出的每小时实际收入。'
  },
  {
    question: '为什么真实时薪比名义时薪低？',
    answer: '因为真实时薪考虑了您工作相关的全部时间和支出，包括通勤时间、加班时间以及各种工作相关花费，这些都会减少您的实际可支配收入。'
  },
  {
    question: '如何提高真实时薪？',
    answer: '可以从几个方面入手：1) 提高 hourly rate；2) 减少通勤时间；3) 减少不必要的工作支出；4) 提高工作效率减少加班。'
  },
  {
    question: '数据安全吗？',
    answer: '所有数据都存储在您本地浏览器的 localStorage 中，不会上传到服务器。您可以随时清除浏览数据来删除所有记录。'
  }
];

interface UsageStep {
  title: string;
  description: string;
  icon: string;
}

const USAGE_STEPS: UsageStep[] = [
  { title: '填写收入信息', description: '输入您的月薪、年终奖和五险一金缴纳比例', icon: '💰' },
  { title: '设置时间成本', description: '填写每日工作时长、通勤时间和加班情况', icon: '⏰' },
  { title: '添加隐形支出', description: '记录工作相关的交通、餐费和其他支出', icon: '📌' },
  { title: '查看测算结果', description: '获取真实时薪和详细的分析报告', icon: '📊' }
];

function UseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>💡 如何使用</h2>
          <button className="btn-secondary" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="usage-steps">
            {USAGE_STEPS.map((step, index) => (
              <div key={index} className="usage-step">
                <span className="step-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="example-section">
            <h3>📊 示例数据</h3>
            <p>点击下方按钮可以填充典型的互联网打工人数据：</p>
            <ul>
              <li>月薪 15,000 元</li>
              <li>年终奖 30,000 元</li>
              <li>每日工作 9 小时，每周 5 天</li>
              <li>单程通勤 60 分钟，平均每天加班 2 小时</li>
              <li>每月通勤 500 元，餐费 800 元</li>
            </ul>
          </div>

          <h3>❓ 常见问题</h3>
          <div className="faq-list">
            {FAQ_DATA.map((item, index) => (
              <div key={index} className="faq-item">
                <h4>Q: {item.question}</h4>
                <p>A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoPage({ onOpenUsage }: { onOpenUsage: () => void }) {
  return (
    <div className="page-container">
      <div className="info-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="info-card"
        >
          <h1 className="info-title">欢迎使用打工人时薪测算工具</h1>
          <p className="info-subtitle">真实计算您的每小时收入，帮助您更好地评估工作价值</p>

          <div className="info-features">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <div className="feature-content">
                <h3>全面计算</h3>
                <p>考虑工作时长、通勤、加班和隐形支出</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div className="feature-content">
                <h3>数据可视化</h3>
                <p>图表展示收入构成和时间分配</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <div className="feature-content">
                <h3>行业对比</h3>
                <p>了解自己在行业中的水平</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <div className="feature-content">
                <h3>本地存储</h3>
                <p>数据自动保存，支持离线使用</p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={onOpenUsage}>
            开始测算
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export { UseModal, InfoPage, USAGE_STEPS };
