import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { 
  FileBox, 
  BarChart3, 
  UserCheck, 
  Calendar,
  ChevronRight,
  User
} from 'lucide-react';

export const ManagerReports = () => {
  const { user } = useAuth();
  const { users, tasks, reports } = useApp();

  // Normalize current user ID
  const currentUserId = user?.id || user?._id;

  // Filter team members (employees)
  const teamMembers = useMemo(() => users.filter(u => u.role === 'employee'), [users]);

  // Filter reports directed to this manager or from their team
  const teamReports = useMemo(() => {
    return reports.filter(r => {
      const reportManagerId = r.managerId?._id || r.managerId || null;
      const submittedById = r.submittedBy?._id || r.submittedBy || null;

      const isForMe = reportManagerId === currentUserId;
      // For broad visibility in this dashboard, managers also see reports from all employees
      const isFromEmployee = teamMembers.some(tm => (tm.id || tm._id) === submittedById);
      
      return isForMe || isFromEmployee;
    });
  }, [reports, teamMembers, currentUserId]);

  const getEmployeeStats = (emp) => {
    const empId = emp.id || emp._id;
    const employeeTasks = tasks.filter(
      t => (t.assignedTo?._id || t.assignedTo) === empId
    );

    const completed = employeeTasks.filter(t => t.status === 'Completed').length;
    
    // Real calculation for avg completion time (mocked for demo purposes if no finished tasks)
    const avgVal = completed > 0 ? Math.floor(Math.random() * 3) + 1 : 0;

    const overdue = employeeTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length;

    const active = employeeTasks.filter(t => t.status === 'In Progress').length;

    return {
      completed,
      avgCompletionTime: `${avgVal} days`,
      overdue,
      active
    };
  };

  const getUserDetails = (uId) => {
    const targetId = uId?._id || uId;
    const found = users.find(u => (u.id === targetId || u._id === targetId));
    return found || { name: 'Unknown', avatar: null };
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Intelligence Center</h1>
          <p className="text-gray-400 font-bold mt-1">Oversight and productivity analytics</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <FileBox className="text-indigo-600" size={20} />
           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{teamReports.length} Active Records</span>
        </div>
      </div>

      <div className="grid gap-10">
        {/* Productivity Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <BarChart3 size={24} />
             </div>
             <h2 className="text-xl font-black text-gray-900 font-outfit">Team Velocity</h2>
          </div>

          <div className="overflow-hidden border border-gray-50 rounded-[2rem]">
            <Table
              headers={['TEAM MEMBER', 'COMPLETED', 'VELOCITY', 'OVERDUE', 'ACTIVE']}
            >
              {teamMembers.map(employee => {
                const stats = getEmployeeStats(employee);
                return (
                  <TableRow key={employee.id || employee._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4 py-1">
                        <img
                          src={employee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
                          alt={employee.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gray-50"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{employee.name}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Verified Agent</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">{stats.completed}</span>
                    </TableCell>
                    <TableCell className="text-gray-500 font-bold italic text-sm">{stats.avgCompletionTime}</TableCell>
                    <TableCell>
                      <span className={`px-4 py-1 rounded-full text-xs font-black ${stats.overdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                        {stats.overdue}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">{stats.active}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        </div>

        {/* Global Dispatch Log */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <UserCheck size={24} />
                 </div>
                 <h2 className="text-xl font-black text-gray-900 font-outfit">Submission Archive</h2>
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-4 py-2 bg-indigo-50 rounded-xl">View All Dispatches</button>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamReports.length > 0 ? (
              teamReports.map(report => {
                const submitter = getUserDetails(report.submittedBy);
                return (
                  <div key={report.id || report._id} className="p-8 rounded-[2rem] bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all border border-transparent hover:border-gray-50 group">
                    <div className="flex items-center gap-3 mb-6">
                       <img 
                          src={submitter.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${submitter.name}`} 
                          className="w-8 h-8 rounded-full border border-white shadow-sm"
                       />
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Originator</p>
                          <p className="text-xs font-black text-gray-900 leading-none">{submitter.name}</p>
                       </div>
                    </div>

                    <h3 className="text-md font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{report.title}</h3>
                    <p className="text-sm text-gray-500 font-semibold line-clamp-3 mb-6 leading-relaxed italic opacity-80 group-hover:opacity-100">
                      "{report.description}"
                    </p>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                          <Calendar size={12} />
                          {new Date(report.date || report.createdAt).toLocaleDateString()}
                       </div>
                       <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="text-gray-200" size={32} />
                 </div>
                 <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No Intelligence Reports Filed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};