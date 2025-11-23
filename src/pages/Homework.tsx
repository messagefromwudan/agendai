import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import HomeworkAddModal, { NewHomework } from '../components/HomeworkAddModal';
import HomeworkCard, { HomeworkCardData } from '../components/HomeworkCard';
import HomeworkFilters, { SortOption, FilterOption } from '../components/HomeworkFilters';
import AIHomeworkFeedbackModal from '../components/AIHomeworkFeedbackModal';
import HomeworkDetailModal from '../components/HomeworkDetailModal';
import AIBreakdownModal from '../components/AIBreakdownModal';
import AIHintsModal from '../components/AIHintsModal';
import ShareModal from '../components/ShareModal';
import Toast from '../components/Toast';

export default function Homework() {
  const [homework, setHomework] = useState<HomeworkCardData[]>([
    {
      id: 1,
      title: 'Quadratic Equations Problem Set',
      subject: 'Mathematics',
      difficulty: 3,
      dueDate: '2024-11-03T14:00',
      completed: false,
      aiSuggestion: 'Review the quadratic formula notes from last week before starting.',
      color: 'blue',
      type: 'Homework',
      description: 'Complete exercises 15-30 from Chapter 5. Focus on applying the quadratic formula and factoring methods.',
    },
    {
      id: 2,
      title: 'Lab Report: Newton\'s Laws',
      subject: 'Physics',
      difficulty: 4,
      dueDate: '2024-11-04T16:00',
      completed: false,
      aiSuggestion: 'Structure your report with hypothesis, method, results, and conclusion.',
      color: 'green',
      type: 'Lab Report',
      important: true,
    },
    {
      id: 3,
      title: 'Essay: Romantic Poetry Analysis',
      subject: 'Literature',
      difficulty: 2,
      dueDate: '2024-11-05T12:00',
      completed: true,
      aiSuggestion: 'Great work! Your analysis was thorough and well-structured.',
      color: 'purple',
      type: 'Project',
      completedAt: '2024-11-01T10:30',
    },
    {
      id: 4,
      title: 'Chemical Reactions Worksheet',
      subject: 'Chemistry',
      difficulty: 1,
      dueDate: '2024-10-30T09:00',
      completed: false,
      aiSuggestion: 'Start with identifying reactants and products in each equation.',
      color: 'orange',
      type: 'Homework',
    },
    {
      id: 5,
      title: 'History Chapter Summary',
      subject: 'History',
      difficulty: 2,
      dueDate: '2024-11-02T15:00',
      completed: true,
      aiSuggestion: 'Excellent understanding of historical context!',
      color: 'red',
      type: 'Homework',
      completedAt: '2024-11-01T14:20',
    },
  ]);

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

  const handleAddHomework = (newHomework: NewHomework) => {
    const homework: HomeworkCardData = {
      id: Math.max(...homework.map(h => h.id), 0) + 1,
      title: newHomework.title,
      subject: newHomework.subject,
      difficulty: newHomework.difficulty,
      dueDate: newHomework.deadline,
      completed: false,
      aiSuggestion: 'AI will analyze this assignment and provide personalized suggestions soon.',
      color: ['blue', 'green', 'purple', 'orange', 'red', 'teal'][Math.floor(Math.random() * 6)],
      type: newHomework.type,
      description: newHomework.description,
    };
    setHomework(prev => [...prev, homework]);
    setToast({ message: 'Assignment added successfully!' });
    setTimeout(() => setToast(null), 5000);
  };

  const handleToggleComplete = (id: number) => {
    const item = homework.find(h => h.id === id);
    if (!item) return;

    const wasCompleted = item.completed;
    setHomework(prev =>
      prev.map(h =>
        h.id === id
          ? {
              ...h,
              completed: !h.completed,
              completedAt: !h.completed ? new Date().toISOString() : undefined,
            }
          : h
      )
    );

    if (!wasCompleted) {
      setToast({
        message: 'Moved to Completed',
        action: { label: 'Undo', data: item },
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleUndoComplete = (item: HomeworkCardData) => {
    setHomework(prev =>
      prev.map(h => (h.id === item.id ? { ...h, completed: false, completedAt: undefined } : h))
    );
    setToast(null);
  };

  const handleReschedule = (id: number, newDate: string) => {
    setHomework(prev => prev.map(h => (h.id === id ? { ...h, dueDate: newDate } : h)));
    setToast({ message: 'Assignment rescheduled successfully!' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleImportant = (id: number) => {
    setHomework(prev => prev.map(h => (h.id === id ? { ...h, important: !h.important } : h)));
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
    setToast({ message: 'AI is generating follow-up exercises...' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Homework & Projects
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Homework</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterSection('all')}
          className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <p className="text-sm text-blue-700 mb-2">Total Assignments</p>
          <p className="text-4xl font-bold text-blue-900">{homework.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('pending')}
          className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'pending' ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <p className="text-sm text-orange-700 mb-2">Pending</p>
          <p className="text-4xl font-bold text-orange-900">{pending.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('completed')}
          className={`bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'completed' ? 'ring-2 ring-green-500' : ''
          }`}
        >
          <p className="text-sm text-green-700 mb-2">Completed This Week</p>
          <p className="text-4xl font-bold text-green-900">{completed.length}</p>
        </button>
        <button
          onClick={() => setFilterSection('overdue')}
          className={`bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all text-left ${
            filterSection === 'overdue' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <p className="text-sm text-red-700 mb-2">Overdue</p>
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
              <p className="font-semibold text-red-900">You have {overdue.length} overdue assignment{overdue.length > 1 ? 's' : ''}</p>
              <p className="text-sm text-red-700 mt-1">
                Review your overdue tasks and reschedule them to stay on track.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {filterSection === 'all' && 'All Assignments'}
          {filterSection === 'pending' && 'Pending Assignments'}
          {filterSection === 'completed' && 'Completed Assignments'}
          {filterSection === 'overdue' && 'Overdue Assignments'}
        </h2>
        <div className="space-y-3">
          {filteredHomework.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-500">No assignments found.</p>
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
