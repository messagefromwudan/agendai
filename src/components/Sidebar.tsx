import { Home, User, BookOpen, Brain, Backpack, Calendar, TrendingUp, MessageSquare, Settings } from 'lucide-react';

type SidebarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Tablou de bord' },
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'grades', icon: BookOpen, label: 'Note' },
    { id: 'ai-tutor', icon: Brain, label: 'Tutore AI' },
    { id: 'homework', icon: Backpack, label: 'Teme' },
    { id: 'schedule', icon: Calendar, label: 'Orar' },
    { id: 'progress', icon: TrendingUp, label: 'Progres' },
    { id: 'messages', icon: MessageSquare, label: 'Mesaje' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#F1F5F9]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#164B2E]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              AgendAI
            </h1>
            <p className="text-xs text-gray-500">Centru inteligent de învățare</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#164B2E] text-[#F1F5F9] shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPage === 'settings'
              ? 'bg-[#164B2E] text-[#F1F5F9]'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Setări</span>
        </button>
      </div>
    </div>
  );
}
