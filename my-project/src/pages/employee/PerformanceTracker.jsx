import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const PerformanceTracker = () => {
  const { user: authUser } = useAuth();
  const { tasks } = useApp();

  // 1. Fix ID Comparison (Normalization)
  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo || null;
      const currentUserId = authUser?.id || authUser?._id;
      return assignedId === currentUserId;
    });
  }, [tasks, authUser]);

  const completedTasks = useMemo(() => 
    myTasks.filter(t => t.status === 'Completed').length, 
  [myTasks]);

  const totalTasks = myTasks.length;

  const completionPercentage =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  /**
   * 2. REAL DATA GRAPHING
   * Calculates actual completions per week from real task data
   */
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Create slots for the last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - (i * 7));
      
      const weekLabel = i === 0 ? 'This Week' : `${i}w ago`;
      
      // Filter tasks completed in this specific 7-day window
      const count = myTasks.filter(t => {
        if (t.status !== 'Completed' || !t.updatedAt) return false;
        const completionDate = new Date(t.updatedAt);
        const diffDays = Math.floor((now - completionDate) / (1000 * 60 * 60 * 24));
        return diffDays >= (i * 7) && diffDays < ((i + 1) * 7);
      }).length;

      data.push({
        week: weekLabel,
        completed: count
      });
    }
    return data;
  }, [myTasks]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col mb-10">
        <h1 className="text-4xl font-black font-outfit text-gray-900 tracking-tight">Performance Analytics</h1>
        <p className="text-gray-500 font-medium">Visualization of your personal throughput and efficiency</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Overall Progress Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
           {/* Top accent */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600" />
           
           <div className="flex justify-between items-end mb-10">
              <div>
                 <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Efficiency Rating</h2>
                 <p className="text-5xl font-black text-gray-900 font-outfit">{completionPercentage}<span className="text-indigo-600">%</span></p>
              </div>
              <div className="flex gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold text-emerald-500 px-3 py-1 bg-emerald-50 rounded-full">ACTIVE</p>
                 </div>
              </div>
           </div>

           <div className="relative w-full bg-gray-50 rounded-full h-6 mb-12 shadow-inner overflow-hidden">
             <div
               className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-200"
               style={{ width: `${completionPercentage}%` }}
             >
                <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-pulse" />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-50">
             <div className="p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
               <p className="text-3xl font-black text-gray-900 mb-1">{totalTasks}</p>
               <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Global Pool</p>
             </div>

             <div className="p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-300">
               <p className="text-3xl font-black text-emerald-500 mb-1">{completedTasks}</p>
               <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Finished</p>
             </div>

             <div className="p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-300">
               <p className="text-3xl font-black text-amber-500 mb-1">
                 {myTasks.filter(t => t.status === 'In Progress').length}
               </p>
               <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Developing</p>
             </div>
           </div>
        </div>

        {/* Real Data Chart Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-xl font-black text-gray-900 font-outfit tracking-tight">Weekly Throughput</h2>
             <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Real Data Engine</span>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke="#f8fafc"
                />
                <XAxis 
                   dataKey="week" 
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 15, fontWeight: 900, fill: '#475569' }}
                   dy={15}
                />
                <YAxis 
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 15, fontWeight: 900, fill: '#475569' }}
                />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9', radius: 12 }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar
                  dataKey="completed"
                  radius={[10, 10, 10, 10]}
                  fill="url(#barGradient)"
                  barSize={40}
                >
                   <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#6366f1" />
                         <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                   </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks completed per 7-day period</p>
          </div>
        </div>
      </div>
    </div>
  );
};