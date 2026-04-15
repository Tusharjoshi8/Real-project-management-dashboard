import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Hexagon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-[2rem] border border-gray-100 shadow-2xl shadow-indigo-200/50 flex flex-col gap-3 min-w-[200px]">
        <p className="text-[10px] font-black text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-widest">{label}</p>
        <div className="space-y-2">
           {payload.map((entry, index) => (
             <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                   <span className="text-xs font-black text-gray-600 uppercase">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{entry.value}</span>
             </div>
           ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminOverview = () => {
  const { users, tasks, activities } = useApp();
  const { user } = useAuth();

  const totalUsers = users?.length || 0;
  const activeTasks = tasks?.filter(t => t.status !== 'Completed').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'Completed').length || 0;
  const pendingTasks = tasks?.filter(t => t.status === 'Pending').length || 0;

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateStr = targetDate.toLocaleDateString();
      const shortDate = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const completed = tasks.filter(t => t.status === 'Completed' && t.updatedAt && new Date(t.updatedAt).toLocaleDateString() === dateStr).length;
      const inProgress = tasks.filter(t => t.status === 'In Progress' && t.updatedAt && new Date(t.updatedAt).toLocaleDateString() === dateStr).length;
      const pending = tasks.filter(t => t.status === 'Pending' && t.createdAt && new Date(t.createdAt).toLocaleDateString() === dateStr).length;

      data.push({ date: shortDate, completed, inProgress, pending });
    }
    return data;
  }, [tasks]);

  return (
    <div className="animate-in fade-in duration-1000">
      <div className="flex justify-between items-end mb-12">
        <div className="relative">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-600 rounded-full" />
           <h1 className="text-5xl font-black text-gray-900 font-outfit tracking-tighter flex items-center gap-4">
              Nexus Master
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-xl shadow-indigo-100 rotate-12">
                 <Hexagon className="w-6 h-6 fill-white opacity-20" />
              </div>
           </h1>
           <p className="text-gray-400 font-bold mt-2 text-sm uppercase tracking-widest">
             Welcome Back, <span className="text-indigo-600">{user?.name}</span> | Real-time global architectural oversight
           </p>
        </div>
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-default">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Global Sync Status: <span className="text-emerald-500">OPTIMIZED</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard title="Ecosystem" value={totalUsers} icon={Users} color="blue" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 group hover:bg-black hover:scale-[1.02] transition-all duration-500" />
        <StatCard title="Active Load" value={activeTasks} icon={Clock} color="yellow" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.02] transition-all" />
        <StatCard title="Total Cleared" value={completedTasks} icon={CheckCircle} color="green" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.02] transition-all" />
        <StatCard title="Risk Level" value={pendingTasks} icon={AlertCircle} color="red" className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 hover:scale-[1.02] transition-all" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-16 relative z-10">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-50 rounded-[1.5rem] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                   <TrendingUp size={28} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 font-outfit uppercase tracking-tighter">Velocity Matrix</h2>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global 7-day task distribution</p>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                <div className="w-6 h-1 bg-gray-100 rounded-full" />
                <div className="w-3 h-1 bg-gray-100 rounded-full" />
             </div>
          </div>

          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={10} margin={{ bottom: 30 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="ongoingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="queuedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 900, fill: '#475569' }} dy={10} />

                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 900, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 24 }} />
                <Bar dataKey="completed" name="Completed" fill="url(#completedGrad)" radius={[12, 12, 12, 12]} barSize={14} />
                <Bar dataKey="inProgress" name="Ongoing" fill="url(#ongoingGrad)" radius={[12, 12, 12, 12]} barSize={14} />
                <Bar dataKey="pending" name="Queued" fill="url(#queuedGrad)" radius={[12, 12, 12, 12]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                   <Activity size={28} />
                </div>
                <h2 className="text-xl font-black text-gray-900 font-outfit uppercase tracking-tighter">Audit Log</h2>
             </div>
             <ArrowUpRight className="text-gray-300" size={24} />
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide">
            {activities && activities.map(activity => (
              <div key={activity.id || activity._id} className="p-6 bg-gray-50/50 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all border border-transparent hover:border-gray-50 group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-black text-white text-sm font-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {activity.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-gray-900 leading-tight">
                        {activity.userName} <span className="font-bold text-gray-400">activated</span> {activity.action}
                      </p>
                      <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.1em] mt-2">
                        {activity.entity} | {activity.details?.substring(0, 40)}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-[9px] text-gray-300 font-black font-mono">
                         <Clock size={10} />
                         {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};