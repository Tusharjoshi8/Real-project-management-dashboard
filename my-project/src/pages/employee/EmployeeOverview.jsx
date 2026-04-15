import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  MousePointer2
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white p-5 rounded-[2rem] shadow-2xl flex flex-col gap-2 min-w-[150px] border border-white/10 backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white">{payload[0].value} <span className="text-emerald-400 text-sm">TASKS</span></p>
        <div className="flex items-center gap-2 mt-2">
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-400 uppercase">Verified Milestone</span>
        </div>
      </div>
    );
  }
  return null;
};

export const EmployeeOverview = () => {
  const { user } = useAuth();
  const { tasks } = useApp();

  const myTasks = useMemo(() => {
    return tasks.filter(t => {
      const assignedId = t.assignedTo?._id || t.assignedTo || null;
      const currentUserId = user?.id || user?._id;
      return assignedId === currentUserId;
    });
  }, [tasks, user]);

  const tasksAssigned = myTasks.length;
  const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
  const completedCount = myTasks.filter(t => t.status === 'Completed').length;
  const overdueCount = myTasks.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const count = myTasks.filter(t => t.status === 'Completed' && t.updatedAt && new Date(t.updatedAt) >= weekStart && new Date(t.updatedAt) <= weekEnd).length;
      data.push({ week: `Phase ${4-i}`, completed: count });
    }
    return data;
  }, [myTasks]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-1000">
      <div className="flex justify-between items-center mb-12">
        <div className="relative">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-600 rounded-full" />
           <h1 className="text-5xl font-black text-gray-900 font-outfit tracking-tighter flex items-center gap-4">
              Welcome Back, <span className="text-indigo-600">{user?.name}</span>
           </h1>
           <p className="text-gray-400 font-bold mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
             Agent Workspace | <span className="text-indigo-600 underline underline-offset-4">Active Session</span>
           </p>
        </div>
        <div className="hidden lg:flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Consistency</p>
              <p className="text-xl font-black text-emerald-500">99.8%</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <MousePointer2 size={24} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard title="Active Assignments" value={tasksAssigned} icon={ClipboardList} color="blue" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 group hover:scale-[1.05] transition-all" />
        <StatCard title="Throughput" value={inProgress} icon={Clock} color="yellow" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.05] transition-all" />
        <StatCard title="Finalized" value={completedCount} icon={CheckCircle} color="green" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.05] transition-all" />
        <StatCard title="Red Zone" value={overdueCount} icon={AlertCircle} color="red" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.05] transition-all" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-black rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:rotate-45 transition-transform duration-700">
             <TrendingUp size={200} />
          </div>

          <div className="flex justify-between items-center mb-16 relative z-10">
             <div>
                <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Performance Velocity</h2>
                <p className="text-xs font-bold text-gray-500 mt-2">Live task completion phase mapping</p>
             </div>
             <div className="p-4 bg-white/10 rounded-2xl text-emerald-400 border border-white/5">
                <TrendingUp size={28} />
             </div>
          </div>

          <div className="h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ bottom: 30 }}>
                <defs>
                  <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 900, fill: '#cbd5e1' }} dy={10} />

                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 900, fill: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={6} fillOpacity={1} fill="url(#colorWave)" name="Verified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[80px]" />
           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-[80px]" />
           
           <h2 className="text-2xl font-black font-outfit mb-6 uppercase tracking-tighter">Mission Focus</h2>
           
           <div className="space-y-8 relative z-10">
              <div className="flex items-start gap-5 p-6 bg-white/10 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Target size={24} className="text-white" />
                 </div>
                 <div>
                    <h3 className="font-black text-sm uppercase tracking-tight">Zero Deficit</h3>
                    <p className="text-xs font-bold text-indigo-100 opacity-70 mt-1">Neutralize {overdueCount} critical overdue targets</p>
                 </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-white/10 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} className="text-white" />
                 </div>
                 <div>
                    <h3 className="font-black text-sm uppercase tracking-tight">Flow Optimization</h3>
                    <p className="text-xs font-bold text-indigo-100 opacity-70 mt-1">Convert {inProgress} ongoing operations</p>
                 </div>
              </div>
           </div>

           <div className="mt-20 relative z-10">
              <div className="flex justify-between items-end mb-4 px-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Daily Quota Yield</span>
                 <span className="text-2xl font-black text-white">82%</span>
              </div>
              <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden p-1 shadow-inner">
                 <div className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] transition-all duration-1000" style={{ width: '82%' }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};