import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { Badge } from '../../components/shared/Badge';
import { Plus, Edit, Trash2, Filter, Search, Check, User } from 'lucide-react';
import { toast } from 'sonner';

export const TaskManagement = () => {
  const { tasks, users, addTask, updateTask, deleteTask } = useApp();
  const { user: authUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Search state for employee selection
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    managerId: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      managerId: (authUser?.role === 'manager' || authUser?.role === 'admin') ? (authUser.id || authUser._id) : '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: ''
    });
    setUserSearchTerm('');
    setShowCreateModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getUserName = (userId) => {
    const user = users.find(u => (u.id === userId || u._id === userId));
    return user ? user.name : 'Unassigned';
  };

  const employees = useMemo(() => users.filter(u => u.role === 'employee'), [users]);
  const managers = useMemo(() => users.filter(u => u.role === 'manager' || u.role === 'admin'), [users]);

  // Filtered employees for the selection list
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [employees, userSearchTerm]);

  const handleCreate = async () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addTask({
        ...formData,
        managerId: formData.managerId || undefined
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async () => {
    if (!selectedTask) return;
    const taskId = selectedTask.id || selectedTask._id;
    await updateTask(taskId, formData);
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const taskId = selectedTask.id || selectedTask._id;
    await deleteTask(taskId);
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      managerId: task.managerId?._id || task.managerId || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setUserSearchTerm('');
    setShowEditModal(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Manage and track team assignments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-semibold"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Filters:</span>
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold text-gray-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold text-gray-700 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <Table headers={['Task Details', 'Assignee', 'Supervisor', 'Status', 'Priority', 'Timeline', 'Actions']}>
          {filteredTasks?.map(task => (
            <TableRow key={task.id || task._id}>
              <TableCell>
                <div className="max-w-xs">
                  <p className="font-bold text-gray-900 mb-0.5">{task.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 italic">{task.description}</p>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                     {getUserName(task.assignedTo?._id || task.assignedTo).charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-700">{getUserName(task.assignedTo?._id || task.assignedTo)}</p>
                     <p className="text-[10px] text-gray-400 font-medium">Employee</p>
                   </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                   <User size={14} className="text-gray-300" />
                   <span className="text-sm font-medium text-gray-500 tracking-tight">
                     {getUserName(task.managerId?._id || task.managerId)}
                   </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    task.status === 'Completed'
                      ? 'success'
                      : task.status === 'In Progress'
                      ? 'info'
                      : 'warning'
                  }
                >
                  {task.status}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    task.priority === 'High'
                      ? 'error'
                      : task.priority === 'Medium'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {task.priority}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Due Date</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Edit Task"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>

      {/* CREATE MODAL with Searchable Employee Selection */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        className="max-w-4xl"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleCreate}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
            >
              Confirm assignment
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          {/* Left Column: Basic Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-medium"
                placeholder="Brief title..."
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none h-32 resize-none transition-all text-sm font-medium"
                placeholder="Optional details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-bold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Supervising Manager</label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-bold appearance-none"
              >
                <option value="">Select Manager</option>
                {managers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Employee Selection with Search */}
          <div className="flex flex-col h-full">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Assign to Employee</label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Filter employees..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-y-auto max-h-80 p-2 space-y-1">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <button
                    key={emp.id || emp._id}
                    onClick={() => setFormData({ ...formData, assignedTo: emp.id || emp._id })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      formData.assignedTo === (emp.id || emp._id) 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'hover:bg-white hover:shadow-sm text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                         formData.assignedTo === (emp.id || emp._id) ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${formData.assignedTo === (emp.id || emp._id) ? 'text-white' : 'text-gray-700'}`}>
                          {emp.name}
                        </p>
                        <p className={`text-[10px] ${formData.assignedTo === (emp.id || emp._id) ? 'text-indigo-100' : 'text-gray-400'}`}>
                           {emp.email}
                        </p>
                      </div>
                    </div>
                    {formData.assignedTo === (emp.id || emp._id) && <Check size={16} />}
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <User size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-tight">No employees found</p>
                </div>
              )}
            </div>
            {formData.assignedTo && (
              <div className="mt-2 bg-indigo-50 p-2 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Selected:</span>
                <span className="text-xs font-bold text-indigo-600 pr-1">{getUserName(formData.assignedTo)}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL - Simpler version of create for speed */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Task Status"
        className="max-w-2xl"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleEdit}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
            >
              Update Changes
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
           <div>
             <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Task Progress</label>
             <div className="grid grid-cols-3 gap-3">
                {['Pending', 'In Progress', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFormData({ ...formData, status })}
                    className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                       formData.status === status 
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                       : 'bg-gray-50 border-transparent text-gray-400 hover:border-indigo-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
           </div>

           <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Supervisor</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Select Manager</option>
                  {managers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
           </div>

           <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-medium text-gray-600 h-24 resize-none transition-all"
              />
           </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleDelete}
              className="flex-1 py-3.5 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-bold shadow-lg shadow-rose-100"
            >
              Confirm Permanent Delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="py-6 text-center">
           <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
           <p className="text-gray-500">You are about to delete <span className="font-bold text-indigo-600">"{selectedTask?.title}"</span>. This action cannot be reversed and all progress will be lost.</p>
        </div>
      </Modal>
    </div>
  );
};