import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { Badge } from '../../components/shared/Badge';

export const EmployeeManagement = () => {
  const { user } = useAuth();
  const { users, tasks } = useApp();

  // Show all employees to the manager so they can interact with the whole team
  const teamMembers = users.filter(u => u.role === 'employee');


  const getEmployeeStats = (emp) => {
    const empId = emp.id || emp._id;
    const employeeTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === empId);

    return {
      totalTasks: employeeTasks.length,
      completed: employeeTasks.filter(t => t.status === 'Completed').length,
      inProgress: employeeTasks.filter(t => t.status === 'In Progress').length,
      pending: employeeTasks.filter(t => t.status === 'Pending').length
    };
  };


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Employee Management
      </h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          headers={[
            'Employee',
            'Email',
            'Status',
            'Total Tasks',
            'Completed',
            'In Progress',
            'Pending'
          ]}
        >
          {teamMembers.map(employee => {
            const stats = getEmployeeStats(employee);

            return (
              <TableRow key={employee.id || employee._id}>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        employee.avatar ||
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                      }
                      alt={employee.name}
                      className="w-8 h-8 rounded-full"
                    />
                    {employee.name}
                  </div>
                </TableCell>

                <TableCell>{employee.email}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      employee.status === 'active'
                        ? 'success'
                        : 'default'
                    }
                  >
                    {employee.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="font-semibold">
                    {stats.totalTasks}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-green-600 font-medium">
                    {stats.completed}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-blue-600 font-medium">
                    {stats.inProgress}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-yellow-600 font-medium">
                    {stats.pending}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </div>

      {teamMembers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            No team members assigned to you yet.
          </p>
        </div>
      )}
    </div>
  );
};