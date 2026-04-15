import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { Badge } from '../../components/shared/Badge';
import { Plus, CheckCircle, Search, User, Filter, Edit, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export const ManagerTasks = () => {
  const { user: authUser } = useAuth();
  const { tasks, users, addTask, updateTask, deleteTask } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });

  // Role-based visible tasks for this manager
  const visibleTasks = useMemo(() => {
    return tasks.filter(t => {
      const isMine = (t.managerId?._id || t.managerId) === (authUser?.id || authUser?._id);
      const wasCreatedByMe = (t.createdBy?._id || t.createdBy) === (authUser?.id || authUser?._id);
      // Backend already filters correctly, but we ensure frontend filtering for safety
      return isMine || wasCreatedByMe;
    });
  }, [tasks, authUser]);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return visibleTasks;
    return visibleTasks.filter(t => t.status === statusFilter);
  }, [visibleTasks, statusFilter]);

  const employees = useMemo(() => users.filter(u => u.role === 'employee'), [users]);
  
  const filteredEmployeesForSelection = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [employees, userSearchTerm]);

  const getUserName = (userId) => {
    const foundUser = users.find(u => (u.id === userId || u._id === userId));
    return foundUser ? foundUser.name : 'Unassigned';
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: ''
    });
    setUserSearchTerm('');
    setShowCreateModal(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setUserSearchTerm('');
    setShowEditModal(true);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addTask({
        ...formData,
        managerId: authUser?.id || authUser?._id
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    const taskId = selectedTask.id || selectedTask._id;
    await updateTask(taskId, formData);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const taskId = selectedTask.id || selectedTask._id;
    await deleteTask(taskId);
    setShowDeleteModal(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black font-outfit text-gray-900 tracking-tight">Team Assignments</h1>
          <p className="text-gray-500 font-medium">Manage and review your team's current tasks</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-bold"
        >
          <Plus size={20} />
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-gray-500 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Task Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
         </div>
         <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
           Active Tasks: {filteredTasks.length}
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm overflow-x-auto">
        <Table headers={['Task', 'Assigned To', 'Status', 'Priority', 'Timeline', 'Actions']}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TableRow key={task.id || task._id}>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-bold text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
                  </div>
                </TableCell>

                <TableCell>
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                        {getUserName(task.assignedTo?._id || task.assignedTo).charAt(0)}
                     </div>
                     <span className="text-sm font-bold text-gray-600">
                        {getUserName(task.assignedTo?._id || task.assignedTo)}
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
                    <span className="text-[10px] font-black text-gray-300 uppercase">Deadline</span>
                    <span className="text-sm font-bold text-gray-700">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
                 <div className="py-12 text-center text-gray-400">
                    <p className="font-bold italic">No tasks found in this category.</p>
                 </div>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </div>

      {/* CREATE MODAL with Searchable Employee Selection */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Team Task"
        className="max-w-4xl"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleCreate}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
            >
              Assign to Employee
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
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-gray-700 transition-all"
                placeholder="Brief title..."
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Details</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none h-32 resize-none font-medium text-gray-600 transition-all"
                placeholder="Optional description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-2xl font-bold text-indigo-600 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Deadline</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Employee Selection */}
          <div className="flex flex-col h-full">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Assign to Member</label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search team..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-y-auto max-h-80 p-2 space-y-1">
              {filteredEmployeesForSelection.length > 0 ? (
                filteredEmployeesForSelection.map(emp => (
                  <button
                    key={emp.id || emp._id}
                    onClick={() => setFormData({ ...formData, assignedTo: emp.id || emp._id })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      formData.assignedTo === (emp.id || emp._id) 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                        : 'hover:bg-white hover:shadow-sm text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                         formData.assignedTo === (emp.id || emp._id) ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div className="text-left font-bold text-sm">
                        {emp.name}
                      </div>
                    </div>
                    {formData.assignedTo === (emp.id || emp._id) && <Check size={16} />}
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-xs font-bold uppercase">No employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Task"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleUpdate}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg"
            >
              Update Task
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 font-bold"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
           <div>
             <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Update Progress</label>
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

           <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 transition-all"
              />
           </div>

           <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Search/Reassign Employee</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="text"
                  placeholder="Change assignee..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                {filteredEmployeesForSelection.slice(0, 5).map(emp => (
                  <button
                    key={emp.id || emp._id}
                    onClick={() => setFormData({ ...formData, assignedTo: emp.id || emp._id })}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      formData.assignedTo === (emp.id || emp._id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {emp.name}
                  </button>
                ))}
              </div>
           </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Task"
        footer={
          <div className="flex gap-4 w-full">
            <button
              onClick={handleDelete}
              className="flex-1 py-3.5 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all font-bold"
            >
              Delete Task
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        }
      >
        <div className="py-6 text-center">
           <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Task?</h3>
           <p className="text-gray-500">Are you sure you want to remove <span className="text-indigo-600 font-bold">"{selectedTask?.title}"</span> from your team's workflow?</p>
        </div>
      </Modal>
    </div>
  );
};