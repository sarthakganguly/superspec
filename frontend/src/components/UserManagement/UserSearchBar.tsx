import { Search, UserPlus, X } from "lucide-react";

interface UserSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onAddUserClick: () => void;
}

export const UserSearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onAddUserClick,
}: UserSearchBarProps) => {
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter users by email..."
          aria-label="Filter users by email"
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label="Clear filter search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onAddUserClick}
        className="inline-flex items-center justify-center space-x-1.5 bg-black text-white px-3.5 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
      >
        <UserPlus size={15} />
        <span>Add User</span>
      </button>
    </div>
  );
};
