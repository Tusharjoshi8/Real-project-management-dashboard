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
  ArrowUpRight
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
  Cell
} from 'recharts';

export const ManagerOverview = () => {
  const { user } = useAuth();
  const { users, tasks, activities } = useApp();

  const currentUserId = user?.id || user?._id;

  // 1. Team Data Normalization
  const teamMembers = useMemo(() => users.filter(u => u.role === 'employee'), [users]);
  
  const teamTasks = useMemo(() => {
    return tasks.filter(t => {
      const isManager = (t.managerId?._id || t.managerId) === currentUserId;
      const createdByMe = (t.createdBy?._id || t.createdBy) === currentUserId;
      // Show reports/tasks to manager of the whole pool for broad oversight in this app
      return isManager || createdByMe || user?.role === 'admin';
    });
  }, [tasks, currentUserId, user?.role]);

  const completedTasksCount = teamTasks.filter(t => t.status === 'Completed').length;
  const overdueTasksCount = teamTasks.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
  ).length;

  // 2. REAL DATA BAR CHART (Tasks per Employee)
  const chartData = useMemo(() => {
    return teamMembers.map(emp => {
      const empId = emp.id || emp._id;
      const empTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === empId);
      
      return {
        name: emp.name.split(' ')[0], // Show first name for cleaner chart
        completed: empTasks.filter(t => t.status === 'Completed').length,
        pending: empTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length,
        total: empTasks.length
      };
    }).sort((a, b) => b.total - a.total).slice(0, 6); // Show top 6
  }, [teamMembers, tasks]);

  // 3. Team Activity Filtering
  const teamActivityLog = useMemo(() => {
    return activities
      .filter(a => {
        const actingUserId = a.userId?._id || a.userId;
        return teamMembers.some(tm => (tm.id || tm._id) === actingUserId) || actingUserId === currentUserId;
      })
      .slice(0, 10);
  }, [activities, teamMembers, currentUserId]);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-10">
        <div className="relative">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-600 rounded-full" />
           <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tighter">
              Welcome Back, <span className="text-indigo-600">{user?.name}</span>
           </h1>
           <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Oversight Hub | Managerial Summary Engine</p>
        </div>
        <div className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-3 text-white">
           <Layers size={20} />
           <span className="text-xs font-black uppercase tracking-widest leading-none">Real-Time Core</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Team Strength"
          value={teamMembers.length}
          icon={Users}
          color="blue"
          className="rounded-[2rem] border-none shadow-sm bg-white"
        />
        <StatCard
          title="Operation Load"
          value={teamTasks.length}
          icon={Clock}
          color="yellow"
          className="rounded-[2rem] border-none shadow-sm bg-white"
        />
        <StatCard
          title="Total Closed"
          value={completedTasksCount}
          icon={CheckCircle}
          color="green"
          className="rounded-[2rem] border-none shadow-sm bg-white"
        />
        <StatCard
          title="Risk Alerts"
          value={overdueTasksCount}
          icon={AlertCircle}
          color="red"
          className="rounded-[2rem] border-none shadow-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-12">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                   <TrendingUp size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-900 font-outfit">Member Efficiency</h2>
             </div>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tasks per employee</p>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
                <XAxis 
                   dataKey="name" 
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
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="completed" 
                  name="Completed" 
                  radius={[8, 8, 0, 0]}
                  barSize={12}
                >
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" />
                   ))}
                </Bar>
                <Bar 
                  dataKey="pending" 
                  name="Ongoing" 
                  radius={[8, 8, 0, 0]}
                  barSize={12}
                >
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-pending-${index}`} fill="#6366f1" />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                   <Activity size={24} />
                </div>
                <h2 className="text-xl font-black text-gray-900 font-outfit">Live Stream</h2>
             </div>
             <ArrowUpRight className="text-gray-300" size={20} />
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide text-left">
            {teamActivityLog.length > 0 ? (
              teamActivityLog.map(activity => (
                <div key={activity.id || activity._id} className="group relative pl-6">
                  {/* Timeline Line */}
                  <div className="absolute left-[3px] top-6 bottom-0 w-[1px] bg-gray-100 group-last:hidden" />
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white" />
                  
                  <div className="p-4 bg-gray-50/50 rounded-2xl group-hover:bg-white group-hover:shadow-xl group-hover:shadow-indigo-50/50 transition-all border border-transparent group-hover:border-gray-100">
                    <p className="text-xs font-black text-gray-900 leading-tight mb-1">
                      {activity.userName}
                    </p>
                    <p className="text-[11px] text-gray-500 font-bold leading-none">
                      {activity.action} {activity.entity}
                    </p>
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-tighter mt-3 font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic font-bold text-sm text-gray-400">
                 System Monitoring Active...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};