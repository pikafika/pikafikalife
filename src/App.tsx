import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import { Calculator } from './features/calculator/Calculator';
import History from './features/history/History';
import Settings from './features/settings/Settings';
import FoodManager from './features/foods/FoodManager';
import { FamilyView } from './features/family/FamilyView';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'calculator':
        return <Calculator />;
      case 'history':
        return <History />;
      case 'family':
        return <FamilyView />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
