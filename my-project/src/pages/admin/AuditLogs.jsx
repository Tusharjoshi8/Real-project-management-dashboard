import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Table, TableRow, TableCell } from '../../components/shared/Table';
import { FileText, Filter } from 'lucide-react';

export const AuditLogs = () => {
  const { auditLogs } = useApp();
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter(
    log => actionFilter === 'all' || log.action === actionFilter
  );

  const uniqueActions = Array.from(
    new Set(auditLogs.map(log => log.action))
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <FileText size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table headers={['Timestamp', 'User', 'Action', 'Entity', 'Details']}>
          {filteredLogs.map(log => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="text-sm">
                  <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </TableCell>

              <TableCell>{log.userName}</TableCell>

              <TableCell>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {log.action}
                </span>
              </TableCell>

              <TableCell>{log.entity}</TableCell>

              <TableCell>
                <span className="text-sm text-gray-600">
                  {log.details}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
};