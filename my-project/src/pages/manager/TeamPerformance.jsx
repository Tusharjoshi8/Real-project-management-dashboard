import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const TeamPerformance = () => {
  const { user } = useAuth();
  const { users, tasks } = useApp();

  // 1. Fix ID Normalization
  const teamMembers = useMemo(() => {
    return users.filter(u => u.role === 'employee'); // Showing all employees for now
  }, [users]);

  const teamTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskManagerId = t.managerId?._id || t.managerId || null;
      const currentUserId = user?.id || user?._id;
      return taskManagerId === currentUserId;
    });
  }, [tasks, user]);

  // 2. REAL DATA LINE CHART (Last 14 days)
  const lineChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayTasks = teamTasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === d.toDateString();
      });

      data.push({
        date: dateStr,
        completed: teamTasks.filter(t => {
            if (t.status !== 'Completed' || !t.updatedAt) return false;
            return new Date(t.updatedAt).toDateString() === d.toDateString();
        }).length,
        inProgress: teamTasks.filter(t => t.status === 'In Progress').length, // Current state snapshots are hard, showing totals
        pending: teamTasks.filter(t => t.status === 'Pending').length
      });
    }
    return data;
  }, [teamTasks]);

  // 3. REAL DATA PIE CHART
  const pieChartData = useMemo(() => {
    const statusCounts = {
      'Pending': teamTasks.filter(t => t.status === 'Pending').length,
      'In Progress': teamTasks.filter(t => t.status === 'In Progress').length,
      'Completed': teamTasks.filter(t => t.status === 'Completed').length,
    };

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [teamTasks]);

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="animate-in fade-in duration-700">
      <h1 className="text-4xl font-black text-gray-900 mb-8 font-outfit tracking-tight">Team Analytics Engine</h1>

      <div className="grid gap-8">
        {/* Line Chart Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
             <h2 className="text-xl font-black text-gray-900 font-outfit">Productivity Velocity</h2>
             <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Live Flow</span>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f8fafc" />
                <XAxis 
                   dataKey="date" 
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
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-10 font-outfit">Task Ecosystem</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative">
            <h2 className="text-xl font-black text-gray-900 mb-8 font-outfit">Vital Stats</h2>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-gray-50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Users</p>
                  <p className="text-3xl font-black text-gray-900">{teamMembers.length}</p>
               </div>
               <div className="p-6 bg-indigo-50 rounded-3xl">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Workload</p>
                  <p className="text-3xl font-black text-indigo-600">{teamTasks.length}</p>
               </div>
               <div className="p-6 bg-emerald-50 rounded-3xl col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Closed Tasks</p>
                    <p className="text-4xl font-black text-emerald-600">
                      {teamTasks.filter(t => t.status === 'Completed').length}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                     <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
               </div>
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-gray-400">Momentum Index</span>
                  <span className="text-gray-900">Optimal</span>
               </div>
               <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%]" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};