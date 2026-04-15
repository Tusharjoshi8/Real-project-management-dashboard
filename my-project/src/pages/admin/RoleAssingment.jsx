import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { Badge } from '../../components/shared/Badge';
import { Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export const RoleAssignment = () => {
  const { users, updateUser } = useApp();
  const [roleChanges, setRoleChanges] = useState({});

  const handleRoleChange = (userId, newRole) => {
    setRoleChanges(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleSave = (userId) => {
    const newRole = roleChanges[userId];
    if (!newRole) return;

    updateUser(userId, { role: newRole });

    setRoleChanges(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });

    toast.success('Role updated successfully');
  };

  const hasChanges = (userId) => roleChanges[userId] !== undefined;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Shield size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold">Role Assignment</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table headers={['User', 'Email', 'Current Role', 'Assign Role', 'Actions']}>
          {users?.map((user) => {
            const currentRole = roleChanges[user.id] || user.role;

            return (
              <TableRow key={user.id || user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.avatar ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {user.name}
                  </div>
                </TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.role === 'admin'
                        ? 'error'
                        : user.role === 'manager'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>

                <TableCell>
                  <select
                    value={currentRole}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value)
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </TableCell>

                <TableCell>
                  {hasChanges(user.id) && (
                    <button
                      onClick={() => handleSave(user.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Save size={14} />
                      Save
                    </button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </div>
    </div>
  );
};