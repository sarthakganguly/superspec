import { Trash2 } from "lucide-react";

export interface ManagedUser {
  id: string;
  email: string;
  role: string;
  is_active?: boolean;
  is_protected?: boolean;
}

interface UserTableProps {
  users: ManagedUser[];
  currentUserId?: string;
  onDeleteClick: (user: ManagedUser) => void;
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "USER":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "VIEWER":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const UserTable = ({ users, currentUserId, onDeleteClick }: UserTableProps) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isProtected = Boolean(u.is_protected || isSelf);
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{u.email}</span>
                      {isSelf && (
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300">
                          You
                        </span>
                      )}
                      {u.is_protected && !isSelf && (
                        <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                          System
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center text-xs text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm">
                    {isProtected ? (
                      <span className="text-xs text-gray-400 italic">Protected</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDeleteClick(u)}
                        aria-label={`Delete user ${u.email}`}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isProtected = Boolean(u.is_protected || isSelf);
          return (
            <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 text-sm truncate">{u.email}</span>
                  {isSelf && (
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full border border-gray-300">
                      You
                    </span>
                  )}
                  {u.is_protected && !isSelf && (
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200">
                      System
                    </span>
                  )}
                </div>
                {!isProtected && (
                  <button
                    type="button"
                    onClick={() => onDeleteClick(u)}
                    aria-label={`Delete user ${u.email}`}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(u.role)}`}>
                  {u.role}
                </span>
                <span className="text-xs text-green-700 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
