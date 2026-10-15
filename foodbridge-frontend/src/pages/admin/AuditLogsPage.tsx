import React, { useState, useEffect } from 'react';
import { adminService, type AdminAuditLogRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  FileText,
  Search,
  RefreshCw,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AdminAuditLogRecord[]>([]);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs();
      setLogs(data);
    } catch {
      showToast('Error', 'Unable to load audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(s) ||
        log.actorAdminEmail.toLowerCase().includes(s) ||
        (log.reason && log.reason.toLowerCase().includes(s)) ||
        (log.entityId && log.entityId.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileText className="w-5 h-5 text-emerald-600 mr-2" />
            Immutable Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-resistant operational ledger recording user verification, policy interventions, and system parameter updates.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadLogs} isLoading={isLoading} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Ledger
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search action, actor email, reason, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'DONATION', 'DELIVERY', 'NGO', 'VOLUNTEER', 'USER', 'SYSTEM_SETTING', 'ISSUE'].map((et) => (
            <button
              key={et}
              onClick={() => setEntityFilter(et)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                entityFilter === et
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {et.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action & Trace ID</th>
                  <th className="p-4">Entity Type & ID</th>
                  <th className="p-4">State Transition</th>
                  <th className="p-4">Reason / Audit Notes</th>
                  <th className="p-4 text-right">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading audit ledger...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No audit log records match filter.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 font-mono text-[11px]">
                          [{log.action}]
                        </div>
                        {log.correlationId && (
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            corr: {log.correlationId.substring(0, 10)}...
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <Badge variant="neutral">{log.entityType}</Badge>
                          <span className="font-mono text-slate-500 text-[11px]">#{log.entityId}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {log.previousState ? (
                            <span>
                              <span className="text-slate-400">{log.previousState}</span> →{' '}
                              <span className="text-emerald-700">{log.newState}</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700">{log.newState || 'ACTIVE'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                        {log.reason || 'Standard operational transition'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-[11px] block">
                          {log.actorRole || 'ADMIN'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.actorEmail || log.actorAdminEmail}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
