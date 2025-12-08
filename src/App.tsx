import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import FloatingAI from './components/FloatingAI';
import Welcome from './pages/Welcome';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Grades from './pages/Grades';
import AITutor from './pages/AITutor';
import Homework from './pages/Homework';
import Schedule from './pages/Schedule';
import Progress from './pages/Progress';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const renderAuthPage = () => {
      switch (currentPage) {
        case 'login':
          return <Login onNavigate={setCurrentPage} />;
        case 'signup':
          return <SignUp onNavigate={setCurrentPage} />;
        default:
          return <Welcome onNavigate={setCurrentPage} />;
      }
    };

    return renderAuthPage();
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile />;
      case 'grades':
        return <Grades />;
      case 'ai-tutor':
        return <AITutor />;
      case 'homework':
        return <Homework />;
      case 'schedule':
        return <Schedule />;
      case 'progress':
        return <Progress onNavigate={setCurrentPage} />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="ml-64 p-8">
        {renderPage()}
      </div>
      {currentPage !== 'ai-tutor' && <FloatingAI />}
    </div>
  );
}

export default App;
