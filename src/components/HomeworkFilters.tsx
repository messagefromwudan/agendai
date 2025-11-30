import { ArrowUpDown, Filter, Star } from 'lucide-react';

export type SortOption = 'subject' | 'dueDate' | 'difficulty';
export type FilterOption = 'all' | 'urgent' | 'flagged';

type HomeworkFiltersProps = {
  sortBy: SortOption;
  filterBy: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
};

export default function HomeworkFilters({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}: HomeworkFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Sortează după:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSortChange('dueDate')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'dueDate'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Termen limită
          </button>
          <button
            onClick={() => onSortChange('subject')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'subject'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Materie
          </button>
          <button
            onClick={() => onSortChange('difficulty')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'difficulty'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dificultate
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrează:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterBy === 'all'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toate
          </button>
          <button
            onClick={() => onFilterChange('urgent')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterBy === 'urgent'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Doar urgente
          </button>
          <button
            onClick={() => onFilterChange('flagged')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filterBy === 'flagged'
                ? 'bg-[#164B2E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="w-3 h-3" />
            Marcate
          </button>
        </div>
      </div>
    </div>
  );
}
