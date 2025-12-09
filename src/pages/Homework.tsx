import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import HomeworkAddModal from '../components/HomeworkAddModal';
import HomeworkCard from '../components/HomeworkCard';
import HomeworkFilters, { SortOption, FilterOption } from '../components/HomeworkFilters';
import AIHomeworkFeedbackModal from '../components/AIHomeworkFeedbackModal';
import HomeworkDetailModal from '../components/HomeworkDetailModal';
import AIBreakdownModal from '../components/AIBreakdownModal';
import AIHintsModal from '../components/AIHintsModal';
import ShareModal from '../components/ShareModal';
import Toast from '../components/Toast';
import {
  fetchHomework,
  createHomework,
  updateHomeworkCompletion,
  updateHomeworkDueDate,
  updateHomeworkImportance,
  type HomeworkItem,
  type NewHomeworkItem,
} from '../utils/homeworkHelpers';

export type HomeworkCardData = HomeworkItem & {
  id: number;
};

export default function Homework() {
  const [homework, setHomework] = useState<HomeworkCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showHintsModal, setShowHintsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<HomeworkCardData | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [toast, setToast] = useState<{ message: string; action?: { label: string; data: HomeworkCardData } } | null>(null);
  const [filterSection, setFilterSection] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    setLoading(true);
    const homeworkData = await fetchHomework();
    const mappedHomework = homeworkData.map((h, index) => ({
      ...h,
      id: index + 1, // Convert string ID to number for compatibility
      subject: h.subjectName,
    }));
    setHomework(mappedHomework);
    setLoading(false);
  };

  const handleAddHomework = async (newHomework: NewHomeworkItem) => {
    const createdHomework = await createHomework(newHomework);
    if (createdHomework) {
      await loadHomework(); // Reload to get fresh data
    }
    setToast({ message: 'Temă adăugată cu succes!' });
    setTimeout(() => setToast(null), 5000);
  };

  const handleToggleComplete = async (id: number) => {
    const item = homework.find(h => h.id === id);
    if (!item) return;

    const wasCompleted = item.completed;
    
    const success = await updateHomeworkCompletion(item.userId, !item.completed);
    if (success) {
      await loadHomework(); // Reload to get fresh data
    }

    if (!wasCompleted) {
      setToast({
        message: 'Mutată la Finalizate',
        action: { label: 'Anulează', data: item },
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleUndoComplete = (item: HomeworkCardData) => {
    updateHomeworkCompletion(item.userId, false).then(() => {
      loadHomework();
    });
    setToast(null);
  };

  const handleReschedule = async (id: number, newDate: string) => {
    const item = homework.find(h => h.id === id);
    if (!item) return;

    const success = await updateHomeworkDueDate(item.userId, newDate);
    if (success) {
      await loadHomework();
    }
    setToast({ message: 'Temă reprogramată cu succes!' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleImportant = async (id: number) => {
    const item = homework.find(h => h.id === id);
    if (!item) return;

    const success = await updateHomeworkImportance(item.userId, !item.important);
    if (success) {
      await loadHomework();
    }
  };

  const handleShare = (id: number) => {
    const item = homework.find(h => h.id === id);
    setSelectedHomework(item || null);
    setShowShareModal(true);
  };

  const handleBreakDown = (id: number) => {
    const item = homework.find(h => h.id === id);
    setSelectedHomework(item || null);
    setShowBreakdownModal(true);
  };

  const handleGetHints = (id: number) => {
    const item = homework.find(h => h.id === id);
    setSelectedHomework(item || null);
    setShowHintsModal(true);
  };

  const handleViewDetails = (id: number) => {
    const item = homework.find(h => h.id === id);
    setSelectedHomework(item || null);
    setShowDetailModal(true);
  };

  const handleViewFeedback = (id: number) => {
    const item = homework.find(h => h.id === id);
    setSelectedHomework(item || null);
    setShowFeedbackModal(true);
  };

  const handleRequestExercise = () => {
    setToast({ message: 'AI generează exerciții de urmărire...' });
    setTimeout(() => setToast(null), 3000);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFilteredAndSorted = () => {
    let filtered = [...homework];

    if (filterSection === 'pending') {
      filtered = filtered.filter(h => !h.completed);
    } else if (filterSection === 'completed') {
      filtered = filtered.filter(h => h.completed);
    } else if (filterSection === 'overdue') {
      filtered = filtered.filter(h => !h.completed && getDaysUntilDue(h.dueDate) < 0);
    }

    if (filterBy === 'urgent') {
      filtered = filtered.filter(h => !h.completed && getDaysUntilDue(h.dueDate) <= 2);
    } else if (filterBy === 'flagged') {
      filtered = filtered.filter(h => h.important);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'subject') {
        return a.subject.localeCompare(b.subject);
      } else if (sortBy === 'difficulty') {
        return b.difficulty - a.difficulty;
      }
      return 0;
    });

    return filtered;
  };

  const pending = homework.filter(h => !h.completed);
  const completed = homework.filter(h => h.completed);
  const overdue = homework.filter(h => !h.completed && getDaysUntilDue(h.dueDate) < 0);

  const filteredHomework = getFilteredAndSorted();
  const showFilters = filterSection === 'all' || filterSection === 'pending';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Teme & Proiecte
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Adaugă Temă</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterSection('all')}
          className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <p className="text-sm text-blue-700 mb-2">Total Teme</p>
          <p className="text-4xl font-bold text-blue-900">{homework.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('pending')}
          className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'pending' ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <p className="text-sm text-orange-700 mb-2">În Așteptare</p>
          <p className="text-4xl font-bold text-orange-900">{pending.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('completed')}
          className={`bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'completed' ? 'ring-2 ring-green-500' : ''
          }`}
        >
          <p className="text-sm text-green-700 mb-2">Finalizate Săptămâna Aceasta</p>
          <p className="text-4xl font-bold text-green-900">{completed.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('overdue')}
          className={`bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'overdue' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <p className="text-sm text-red-700 mb-2">Întârziate</p>
          <p className="text-4xl font-bold text-red-900">{overdue.length}</p>
        </button>
      </div>

      {showFilters && (
        <HomeworkFilters
          sortBy={sortBy}
          filterBy={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
        />
      )}

      {overdue.length > 0 && filterSection === 'all' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Ai {overdue.length} tem{overdue.length > 1 ? 'e' : 'ă'} întârziat{overdue.length > 1 ? 'e' : 'ă'}</p>
              <p className="text-sm text-red-700 mt-1">
                Revizuiește temele întârziate și reprogramează-le pentru a rămâne la zi.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {filterSection === 'all' && 'Toate Temele'}
          {filterSection === 'pending' && 'Teme În Așteptare'}
          {filterSection === 'completed' && 'Teme Finalizate'}
          {filterSection === 'overdue' && 'Teme Întârziate'}
        </h2>
        <div className="space-y-3">
          {filteredHomework.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">Nu s-au găsit teme.</p>
            </div>
          ) : (
            filteredHomework.map(item => (
              <HomeworkCard
                key={item.id}
                homework={item}
                onToggleComplete={handleToggleComplete}
                onReschedule={handleReschedule}
                onToggleImportant={handleToggleImportant}
                onShare={handleShare}
                onBreakDown={handleBreakDown}
                onGetHints={handleGetHints}
                onClick={handleViewDetails}
                onViewFeedback={item.completed ? handleViewFeedback : undefined}
              />
            ))
          )}
        </div>
      </div>

      <HomeworkAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddHomework}
      />

      <AIHomeworkFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        homework={selectedHomework}
        onRequestExercise={handleRequestExercise}
      />

      <HomeworkDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        homework={selectedHomework}
      />

      <AIBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        homework={selectedHomework}
      />

      <AIHintsModal
        isOpen={showHintsModal}
        onClose={() => setShowHintsModal(false)}
        homework={selectedHomework}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        homework={selectedHomework}
      />

      {toast && (
        <Toast
          message={toast.message}
          action={toast.action ? { label: toast.action.label, onClick: () => handleUndoComplete(toast.action!.data) } : undefined}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
