type ThemeOptionPreviewProps = {
  theme: 'light' | 'dark' | 'system';
};

export default function ThemeOptionPreview({ theme }: ThemeOptionPreviewProps) {
  if (theme === 'light') {
    return (
      <div className="w-20 h-14 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="h-2 bg-gray-100 border-b border-gray-200"></div>
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded w-full"></div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (theme === 'dark') {
    return (
      <div className="w-20 h-14 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-sm">
        <div className="h-2 bg-gray-800 border-b border-gray-700"></div>
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 bg-gray-700 rounded w-full"></div>
          <div className="h-1.5 bg-gray-700 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 h-14 border border-gray-200 rounded-lg overflow-hidden shadow-sm flex">
      <div className="flex-1 bg-white border-r border-gray-200">
        <div className="h-2 bg-gray-100 border-b border-gray-200"></div>
        <div className="p-1 space-y-0.5">
          <div className="h-1 bg-gray-200 rounded w-full"></div>
          <div className="h-1 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="flex-1 bg-gray-900">
        <div className="h-2 bg-gray-800 border-b border-gray-700"></div>
        <div className="p-1 space-y-0.5">
          <div className="h-1 bg-gray-700 rounded w-full"></div>
          <div className="h-1 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
