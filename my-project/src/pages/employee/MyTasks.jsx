import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Badge } from '../../components/shared/Badge';
import { Filter, Calendar, Clock, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const MyTasks = () => {
  const { user: authUser } = useAuth();
  const { tasks, updateTask } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // NORMALIZED FILTER: Handle populated objects from MongoDB
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo || null;
      const currentUserId = authUser?.id || authUser?._id;
      return assignedId === currentUserId;
    });
  }, [tasks, authUser]);

  const filteredTasks = useMemo(() => {
    return myTasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [myTasks, statusFilter, priorityFilter]);

  const handleStatusChange = async (taskId, currentStatus, newStatus) => {
    if (currentStatus === 'Completed' && newStatus !== 'Completed') {
       toast.error('Task is already completed');
       return;
    }

    try {
      await updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit text-gray-900 tracking-tight">My Workspace</h1>
          <p className="text-gray-500 font-medium mt-1">Focus on your assigned goals and milestones</p>
        </div>

        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-2">
           <div className="flex items-center gap-2 px-3 border-r border-gray-100">
              <Filter size={16} className="text-gray-400" />
           </div>
           <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-gray-500 py-1.5 focus:ring-0 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">Working</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-gray-500 py-1.5 focus:ring-0 outline-none cursor-pointer"
            >
              <option value="all">Any Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div
              key={task.id || task._id}
              className="group bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 relative overflow-hidden"
            >
              {/* Highlight bar for priority */}
              <div className={`absolute top-0 left-0 w-2 h-full ${
                task.priority === 'High' ? 'bg-rose-500' : 
                task.priority === 'Medium' ? 'bg-amber-500' : 'bg-indigo-300'
              }`} />

              <div className="flex justify-between items-start mb-6">
                <Badge
                  variant={
                    task.status === 'Completed' ? 'success' : 
                    task.status === 'In Progress' ? 'info' : 'warning'
                  }
                >
                  {task.status}
                </Badge>
                <div className="flex gap-1">
                   {task.priority === 'High' && <AlertCircle size={18} className="text-rose-500 animate-pulse" />}
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                {task.title}
              </h3>

              <p className="text-sm text-gray-500 mb-8 font-medium line-clamp-3 leading-relaxed">
                {task.description || 'No additional details provided for this assignment.'}
              </p>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                       {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'Flexible'}
                    </span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-400">
                    <Clock size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                       Created {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-500">
                       {authUser?.name?.charAt(0)}
                    </div>
                 </div>

                 {task.status !== 'Completed' ? (
                   <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(task.id || task._id, task.status, task.status === 'Pending' ? 'In Progress' : 'Completed')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-gray-100"
                      >
                         {task.status === 'Pending' ? 'Start Task' : 'Complete'}
                         <ChevronRight size={14} />
                      </button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                      <CheckCircle2 size={16} />
                      Finished
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 p-24 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Clock size={32} className="text-gray-300" />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">Queue is Empty</p>
          <p className="text-gray-400 font-medium">You don't have any tasks matching your current filters.</p>
        </div>
      )}
    </div>
  );
};