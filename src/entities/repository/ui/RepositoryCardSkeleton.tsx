export const RepositoryCardSkeleton = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
      <div className="flex flex-col">
        {/* Top section: Name, stars/commit date, GitHub link */}
        <div className="flex justify-between items-start mb-2">
          {/* Left part: Name and meta info */}
          <div>
            {/* Repository Name (text-xl font-bold) */}
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
            
            {/* Meta info: Stars and Last Commit (flex items-center gap-4 mt-1) */}
            <div className="flex items-center gap-4 mt-1">
              {/* Stars (icon + text-sm) */}
              <div className="flex items-center">
                <div className="h-4 w-4 bg-slate-200 rounded mr-1"></div>
                <div className="h-4 bg-slate-200 rounded w-8"></div>
              </div>
              {/* Last Commit (text-sm) */}
              <div className="h-4 bg-slate-200 rounded w-32 md:w-40"></div>
            </div>
          </div>
          
          {/* Right part: GitHub link (text-sm) */}
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
        
        {/* Description is NOT shown in the list view based on the screenshot */}
        {/* Languages are also NOT shown in the list view */}
      </div>
    </div>
  );
}; 