import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { Head } from '@inertiajs/react';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import {
  Activity,
  Calendar,
  Clock,
  Eye,
  FileCode,
  Filter,
  Globe,
  History,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';

type ActivityLogItem = {
  id: number;
  user_id: number | null;
  actor_name: string;
  actor_role: string;
  action: string;
  description: string;
  subject_type: string | null;
  subject_id: number | string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    email: string;
    fname: string;
    lname: string;
    role: string;
  } | null;
};

type Props = {
  stats: {
    total_logs: number;
    logs_today: number;
    distinct_actors: number;
    distinct_actions: number;
  };
  availableRoles: string[];
  availableActions: string[];
};

export default function AdminActivityLogsPage({ stats, availableRoles, availableActions }: Props) {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchLogs = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);
    try {
      const response = await axios.get(route('admin.activity-logs.get-data'), {
        params: {
          page: currentPage,
          per_page: currentSize,
          search: search.trim() || undefined,
          role: selectedRole !== 'all' ? selectedRole : undefined,
          action: selectedAction !== 'all' ? selectedAction : undefined,
        },
      });

      setLogs(response.data.data);
      setTotal(response.data.total);
      setPage(response.data.current_page);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1, pageSize);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedRole, selectedAction]);

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchLogs(pagination.current, pagination.pageSize);
  };

  const openDetail = (record: ActivityLogItem) => {
    setSelectedLog(record);
    setDrawerOpen(true);
  };

  const getRoleTagColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'gold';
      case 'staff':
        return 'green';
      case 'youth':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getActionTagColor = (action: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('delete') || act.includes('reject') || act.includes('cancel')) return 'red';
    if (act.includes('release') || act.includes('disburse')) return 'emerald';
    if (act.includes('approve') || act.includes('create') || act.includes('select')) return 'green';
    if (act.includes('password')) return 'purple';
    if (act.includes('attendance')) return 'cyan';
    if (act.includes('update') || act.includes('edit')) return 'orange';
    return 'blue';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const columns: ColumnsType<ActivityLogItem> = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 175,
      render: (val: string) => (
        <div>
          <span className="font-semibold text-stone-800 text-xs block">{formatDate(val)}</span>
          <span className="text-[11px] text-stone-400">
            {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'actor_name',
      key: 'actor_name',
      width: 180,
      render: (val: string, record) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-stone-900 text-xs truncate max-w-[170px]" title={val}>
            {val || 'System'}
          </span>
          <div className="flex items-center gap-1">
            <Tag color={getRoleTagColor(record.actor_role)} className="uppercase text-[10px] font-bold py-0 px-1 m-0">
              {record.actor_role || 'user'}
            </Tag>
            {record.user_id && (
              <span className="text-[10px] text-stone-400">ID #{record.user_id}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (val: string) => (
        <Tag color={getActionTagColor(val)} className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
          {val ? val.replace(/_/g, ' ') : 'LOG'}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val: string) => (
        <span className="text-stone-700 text-xs font-medium" title={val}>
          {val}
        </span>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (val: string) => (
        <span className="text-[11px] text-stone-500 font-mono">
          {val || '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'operations',
      width: 80,
      align: 'center',
      render: (_: any, record: ActivityLogItem) => (
        <Tooltip title="View full audit record">
          <Button
            size="small"
            type="text"
            icon={<Eye size={15} className="text-stone-600 hover:text-stone-900" />}
            onClick={() => openDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Head title="Activity & Audit Logs" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-100 p-2 text-amber-900">
                <History size={22} />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">
                Audit & Activity Logs
              </h1>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              System-wide audit trail of administrative changes, staff authorizations, disbursements, and account operations.
            </p>
          </div>

          <Button
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            onClick={() => fetchLogs(page, pageSize)}
            className="w-fit"
          >
            Refresh
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Audit Records</p>
                <p className="mt-1 text-2xl font-black text-stone-900">{stats.total_logs}</p>
              </div>
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <History size={22} />
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Logged Today</p>
                <p className="mt-1 text-2xl font-black text-emerald-800">{stats.logs_today}</p>
              </div>
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <Clock size={22} />
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Actors</p>
                <p className="mt-1 text-2xl font-black text-stone-900">{stats.distinct_actors}</p>
              </div>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Users size={22} />
              </span>
            </div>
          </Card>

          <Card className="rounded-2xl border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Action Types</p>
                <p className="mt-1 text-2xl font-black text-stone-900">{stats.distinct_actions}</p>
              </div>
              <span className="rounded-xl bg-purple-50 p-2.5 text-purple-700">
                <ShieldCheck size={22} />
              </span>
            </div>
          </Card>
        </div>

        {/* Filter Controls & Search */}
        <Card className="rounded-2xl border-stone-200/80 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <Input
                placeholder="Search actor, description, action, IP..."
                prefix={<Search size={15} className="text-stone-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                className="w-full sm:w-72"
              />

              <Select
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
                className="w-36"
                options={[
                  { value: 'all', label: 'All Roles' },
                  ...availableRoles.map((r) => ({
                    value: r,
                    label: r.charAt(0).toUpperCase() + r.slice(1),
                  })),
                ]}
              />

              <Select
                value={selectedAction}
                onChange={(val) => setSelectedAction(val)}
                className="w-48"
                options={[
                  { value: 'all', label: 'All Action Types' },
                  ...availableActions.map((a) => ({
                    value: a,
                    label: a.replace(/_/g, ' ').toUpperCase(),
                  })),
                ]}
              />
            </div>

            <div className="text-xs text-stone-500">
              Showing <span className="font-bold text-stone-800">{logs.length}</span> of {total} records
            </div>
          </div>

          <div className="mt-4">
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                pageSizeOptions: ['15', '30', '50', '100'],
              }}
              onChange={handleTableChange}
              locale={{
                emptyText: (
                  <Empty
                    description="No activity log records found matching your criteria."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </div>
        </Card>
      </div>

      {/* Detailed Log Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-600" />
            <span className="font-bold text-stone-900">Audit Record Details #{selectedLog?.id}</span>
          </div>
        }
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedLog && (
          <div className="flex flex-col gap-5">
            <Descriptions bordered size="small" column={1} className="rounded-xl overflow-hidden">
              <Descriptions.Item label="Timestamp">
                <span className="font-semibold text-stone-900">{formatDate(selectedLog.created_at)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Actor">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{selectedLog.actor_name || 'System'}</span>
                  <Tag color={getRoleTagColor(selectedLog.actor_role)} className="uppercase text-[10px] font-bold">
                    {selectedLog.actor_role}
                  </Tag>
                  {selectedLog.user_id && <span className="text-xs text-stone-400">User ID #{selectedLog.user_id}</span>}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Action">
                <Tag color={getActionTagColor(selectedLog.action)} className="font-bold uppercase tracking-wider">
                  {selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <span className="font-medium text-stone-800">{selectedLog.description}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Subject">
                <span className="font-mono text-xs text-stone-700">
                  {selectedLog.subject_type ? `${selectedLog.subject_type} (#${selectedLog.subject_id})` : 'N/A'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                <span className="font-mono text-xs text-stone-700">{selectedLog.ip_address || 'N/A'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <span className="text-[11px] text-stone-600 break-all">{selectedLog.user_agent || 'N/A'}</span>
              </Descriptions.Item>
            </Descriptions>

            {/* Changed Values Diff */}
            {(selectedLog.old_values || selectedLog.new_values) && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                  State Changes (Old vs New Values)
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-2.5">
                    <p className="text-[11px] font-bold text-red-800 uppercase">Old Values</p>
                    <pre className="mt-1 overflow-x-auto text-[11px] font-mono text-stone-800">
                      {JSON.stringify(selectedLog.old_values, null, 2) || 'None'}
                    </pre>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase">New Values</p>
                    <pre className="mt-1 overflow-x-auto text-[11px] font-mono text-stone-800">
                      {JSON.stringify(selectedLog.new_values, null, 2) || 'None'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata JSON */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                  Context Metadata
                </p>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <pre className="overflow-x-auto text-[11px] font-mono text-stone-800">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}

AdminActivityLogsPage.layout = (page: ReactElement) => (
  <AdminAuthLayout user={page.props.auth.user}>{page}</AdminAuthLayout>
);
