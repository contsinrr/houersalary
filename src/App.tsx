import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContainer from './components/MainContainer';
import IncomePage from './pages/IncomePage';
import TimeCostPage from './pages/TimeCostPage';
import ExpensesPage from './pages/ExpensesPage';
import ResultPage from './pages/ResultPage';
import { UseModal } from './components/InfoPage';
import { EXAMPLE_DATA } from './utils/constants';
import { useIncome } from './hooks/useData';
import { useTimeCost } from './hooks/useData';
import { useExpenses } from './hooks/useData';

function App() {
  const { updateIncome } = useIncome();
  const { updateTimeCost } = useTimeCost();
  const { updateExpenses, addExpenseItem } = useExpenses();
  const [showUsageModal, setShowUsageModal] = useState(false);

  const fillExampleData = () => {
    updateIncome(EXAMPLE_DATA.income);
    updateTimeCost(EXAMPLE_DATA.timeCost);

    // 清空现有支出项
    updateExpenses({
      monthlyCommuteCost: EXAMPLE_DATA.expenses.monthlyCommuteCost,
      monthlyMealCost: EXAMPLE_DATA.expenses.monthlyMealCost,
      otherExpenses: []
    });

    // 添加示例的其他支出项
    EXAMPLE_DATA.expenses.otherExpenses.forEach(item => {
      addExpenseItem({ ...item, id: Math.random().toString(36).substr(2, 9) });
    });
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          showHelp
          onHelp={() => setShowUsageModal(true)}
          onFillExample={fillExampleData}
        />
        <MainContainer>
          <Routes>
            <Route path="/income" element={<IncomePage />} />
            <Route path="/time-cost" element={<TimeCostPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/" element={<Navigate to="/income" replace />} />
          </Routes>
        </MainContainer>
        <Footer />
        <UseModal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
