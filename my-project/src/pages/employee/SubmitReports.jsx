import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { usersAPI } from '../../api';
import { Send, FileText, UserCheck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const SubmitReports = () => {
  const { user } = useAuth();
  const { tasks, reports, addReport } = useApp();

  const [localUsers, setLocalUsers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // FORCE FETCH MANAGERS ON MOUNT
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setIsLoadingManagers(true);
        const res = await usersAPI.getUsers();
        if (res.data && res.data.data) {
           setLocalUsers(res.data.data);
           console.log('Force Fetched Users:', res.data.data);
        }
      } catch (err) {
        console.error('Failed to force fetch managers:', err);
      } finally {
        setIsLoadingManagers(false);
      }
    };
    fetchManagers();
  }, []);

  // Filter tasks assigned to current user
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo || null;
      const currentUserId = user?.id || user?._id;
      return assignedId === currentUserId;
    });
  }, [tasks, user]);

  // Map managers with fallback for name
  const managersList = useMemo(() => {
    const list = localUsers
      .filter(u => u.role === 'manager')
      .map(m => ({
        id: m._id || m.id,
        displayName: m.name || m.email || 'Unnamed Manager'
      }));
    console.log('Processed Managers List:', list);
    return list;
  }, [localUsers]);

  const myReports = useMemo(() => {
    return reports.filter(r => {
      const submittedBy = r.submittedBy?._id || r.submittedBy || null;
      const currentUserId = user?.id || user?._id;
      return submittedBy === currentUserId;
    });
  }, [reports, user]);

  const handleSubmit = async () => {
    if (!title || !description || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!managerId) {
      toast.error('Please select a manager to report to');
      return;
    }

    const res = await addReport({
      title,
      description,
      relatedTaskId: relatedTaskId || undefined,
      managerId,
      date
    });

    if (res.success) {
      setTitle('');
      setDescription('');
      setRelatedTaskId('');
      setManagerId('');
      setDate(new Date().toISOString().split('T')[0]);
      toast.success('Report submitted successfully');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight flex items-center gap-3">
              Reporting Suite
              <ShieldCheck className="text-emerald-500 w-8 h-8" />
           </h1>
           <p className="text-gray-400 font-medium mt-1">Submit your task updates to management</p>
        </div>
        <div className={`flex items-center gap-2 px-6 py-3 rounded-full border border-gray-100 italic text-[10px] font-black transition-all ${isLoadingManagers ? 'text-amber-500 bg-amber-50 animate-pulse' : 'text-emerald-500 bg-emerald-50'}`}>
           <RefreshCcw size={10} className={isLoadingManagers ? 'animate-spin' : ''} /> 
           {isLoadingManagers ? 'SYNCING MANAGERS...' : 'CONNECTION STABLE'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Report Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
               <FileText size={180} />
            </div>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <Send size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-gray-900 font-outfit">Priority Dispatch</h2>
                 <p className="text-sm text-gray-400 font-medium font-mono uppercase tracking-tighter">Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Topic / Subject *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task progress milestone (e.g. Frontend Redesign Complete)"
                  className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800 transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Executive Summary *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide a detailed update on your progress, blockers, or future next steps..."
                  rows={6}
                  className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800 transition-all resize-none placeholder:text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <UserCheck size={12} /> Target Stakeholder (Manager) *
                    </label>
                    <div className="relative group">
                      <select
                        value={managerId}
                        onChange={e => setManagerId(e.target.value)}
                        disabled={isLoadingManagers}
                        className="w-full px-8 py-5 bg-indigo-50/50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-600 transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">{isLoadingManagers ? 'Syncing...' : 'Choose Manager'}</option>
                        {managersList.map(mgr => (
                          <option key={mgr.id} value={mgr.id}>
                            {mgr.displayName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-300 group-hover:text-indigo-500 transition-colors">
                         <UserCheck size={18} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Associated Mission (Task)</label>
                    <div className="relative">
                      <select
                        value={relatedTaskId}
                        onChange={e => setRelatedTaskId(e.target.value)}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-600 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">General Update</option>
                        {myTasks.map(task => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Report Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-gray-500 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoadingManagers}
                className="mt-6 flex items-center justify-center gap-4 w-full py-6 bg-indigo-600 text-white rounded-[2rem] hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={24} />
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>

        {/* My Reports Timeline */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col h-full h-[810px]">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-black text-gray-900 font-outfit">Archive</h2>
             <span className="text-[10px] font-black text-gray-300 px-3 py-1.5 border border-gray-100 rounded-2xl">{myReports.length} ENTRIES</span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-none">
            {myReports.length > 0 ? (
              myReports.map(report => (
                <div
                  key={report.id}
                  className="p-8 rounded-[2rem] bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-100 transition-all cursor-default group border border-transparent hover:border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-extrabold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-tight">{report.title}</h3>
                     <span className="text-[9px] font-black text-gray-300 uppercase shrink-0 pt-1 font-mono">
                        {new Date(report.date).toLocaleDateString().split('/').join('.')}
                     </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed font-semibold italic">
                    "{report.description}"
                  </p>
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Delivered</span>
                     </div>
                     <FileText size={14} className="text-gray-200" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="text-gray-200" size={32} />
                 </div>
                 <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Vault Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};