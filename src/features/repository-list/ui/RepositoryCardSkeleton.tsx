export const RepositoryCardSkeleton = () => {
  return (
    // Ensuring padding matches the visual structure of the actual Card used in RepositoryCard
    // The outer div of RepositoryCard is a `Card` component, which might add its own padding.
    // We assume p-6 based on typical card design, adjust if Card component uses different padding.
    <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
      <div className="flex flex-col">
        {/* Top section: Name, stars/commit date, GitHub link */}
        <div className="flex justify-between items-start mb-2"> {/* Matches RepositoryCard structure */}
          {/* Left part: Name and meta info */}
          <div>
            {/* Repository Name (text-xl font-bold) */}
            {/* Width can be a bit variable, 3/4 is a good approximation */}
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
            
            {/* Meta info: Stars and Last Commit (flex items-center gap-4 mt-1) */}
            <div className="flex items-center gap-4 mt-1">
              {/* Stars (icon + text-sm) */}
              <div className="flex items-center">
                <div className="h-4 w-4 bg-slate-200 rounded mr-1"></div> {/* Star icon placeholder */}
                <div className="h-4 bg-slate-200 rounded w-8"></div>   {/* Star count (e.g., "0", "1", "15") */}
              </div>
              {/* Last Commit (text-sm) - length can vary, e.g., "5 месяцев назад" vs "больше 2 лет назад" */}
              <div className="h-4 bg-slate-200 rounded w-32 md:w-40"></div> {/* Commit date string */}
            </div>
          </div>
          
          {/* Right part: GitHub link (text-sm) */}
          <div className="h-4 bg-slate-200 rounded w-12"></div> {/* "GitHub" link placeholder */}
        </div>
        
        {/* Description is NOT shown in the list view based on the screenshot */}
        {/* Languages are also NOT shown in the list view */}
      </div>
    </div>
  );
}; 