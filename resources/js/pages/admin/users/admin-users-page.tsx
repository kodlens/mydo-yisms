import { EditOutlined, FileAddOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { App, Button, Empty, Form, Input, Pagination, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { ReactElement, useState } from 'react';

import { SharedData, User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Trash } from 'lucide-react';

import AdminAuthLayout from '@/layouts/admin-auth-layout';
import ChangePassword from './partials/change-password';
import ModalCreateEditUser from './partials/modal-create-edit';

const { Column } = Table;

const AdminUsersPage = () => {
    const [form] = Form.useForm();
    const { notification } = App.useApp();

    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User>();
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['users', perPage, page, search],
        queryFn: async () => {
            const params = [`perpage=${perPage}`, `page=${page}`, `search=${search}`].join('&');

            const res = await axios.get(`/admin/get-users?${params}`);
            return res.data;
        },
    });

    const applySearch = (value?: string) => {
        setPage(1);
        setSearch((value ?? searchInput).trim());
    };

    const clearSearch = () => {
        setPage(1);
        setSearchInput('');
        setSearch('');
    };

    const handleNew = () => {
        setUser(undefined);
        setOpen(true);
    };

    const handleEdit = async (record: User) => {
        setUser(record);
        setOpen(true);
    };

    const handleDelete = async (userId: number) => {
        const res = await axios.delete(`/admin/users/${userId}`);
        if (res.data.status === 'deleted') {
            notification.success({
                title: 'Deleted',
                description: 'User removed successfully',
            });
            refetch();
        }
    };

    return (
        <>
            <Head title="User Management" />

            <div className="mx-auto max-w-7xl">
                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />
                    <div className="border-b border-slate-100 px-4 py-6 sm:px-6 sm:py-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                                <TeamOutlined className="text-xl" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Admin Workspace</p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Users</h1>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Manage user accounts, roles, and login access settings.</p>
                            </div>

                            <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 sm:ml-auto sm:w-auto sm:min-w-36">
                                <p className="text-xs font-medium text-emerald-800">{search ? 'Matching users' : 'Total users'}</p>
                                <p className="mt-2 text-3xl leading-none font-semibold text-emerald-950 tabular-nums">
                                    {data ? data.total.toLocaleString() : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">User directory</h2>
                                <p className="mt-1 text-sm text-slate-500">Find an account and manage its access.</p>
                            </div>
                            <Button className="w-full sm:w-auto" size="large" type="primary" icon={<FileAddOutlined />} onClick={handleNew}>
                                Add user
                            </Button>
                        </div>

                        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <label htmlFor="user-search" className="mb-2 block text-xs font-medium text-slate-600">
                                Find a user
                            </label>
                            <div className="flex flex-col gap-3 md:flex-row">
                                <Input
                                    id="user-search"
                                    size="large"
                                    value={searchInput}
                                    prefix={<SearchOutlined className="text-slate-400" />}
                                    placeholder="Search by username, first name, or last name"
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') applySearch();
                                    }}
                                    allowClear
                                />
                                <div className="flex gap-2">
                                    <Button size="large" className="flex-1 md:flex-none" onClick={clearSearch}>
                                        Clear
                                    </Button>
                                    <Button
                                        size="large"
                                        className="flex-1 md:flex-none"
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        loading={isFetching}
                                        onClick={() => applySearch()}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Table
                            size="large"
                            tableLayout="fixed"
                            className="overflow-hidden rounded-xl border border-slate-200 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-slate-600"
                            rowKey="id"
                            loading={isFetching}
                            pagination={false}
                            dataSource={Array.isArray(data?.data) ? data?.data : []}
                            rowClassName={() => 'hover:bg-slate-50'}
                            scroll={{ x: 1060 }}
                            locale={{
                                emptyText: isFetching ? (
                                    'Loading users...'
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="py-2">
                                                <p className="font-medium text-slate-700">{search ? 'No matching users' : 'No users yet'}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {search ? 'Try another name or clear your search.' : 'Add a user to get started.'}
                                                </p>
                                            </div>
                                        }
                                    />
                                ),
                            }}
                        >
                            <Column
                                title="User"
                                dataIndex="name"
                                width={280}
                                render={(_, row: User) => (
                                    <div className="flex items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-800"
                                        >
                                            {`${row.fname?.[0] ?? ''}${row.lname?.[0] ?? ''}`.toUpperCase() || 'U'}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm leading-6 font-semibold break-words text-slate-900">
                                                {[row.lname, [row.fname, row.mname].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
                                                    'Name not provided'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400 tabular-nums">ID #{row.id}</p>
                                        </div>
                                    </div>
                                )}
                            />
                            <Column
                                title="Username"
                                dataIndex="username"
                                width={160}
                                render={(value) => <span className="text-sm break-words text-slate-600">{value || 'Not provided'}</span>}
                            />

                            <Column
                                title="Email"
                                width={250}
                                dataIndex="email"
                                ellipsis={{ showTitle: false }}
                                render={(email: string) => (
                                    <Tooltip title={email}>
                                        <span className="block truncate text-sm text-slate-600">{email || 'Not provided'}</span>
                                    </Tooltip>
                                )}
                            />
                            <Column
                                title="Role"
                                dataIndex="role"
                                width={130}
                                render={(role: string) => (
                                    <Tag
                                        color={
                                            role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrator'
                                                ? 'blue'
                                                : role?.toLowerCase() === 'publisher'
                                                  ? 'cyan'
                                                  : 'geekblue'
                                        }
                                    >
                                        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unassigned'}
                                    </Tag>
                                )}
                            />
                            <Column
                                title="OJT"
                                dataIndex="is_ojt"
                                key="is_ojt"
                                align="center"
                                width={90}
                                render={(is_ojt) => (
                                    <span
                                        className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            is_ojt ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {is_ojt ? 'Yes' : 'No'}
                                    </span>
                                )}
                            />
                            <Column
                                title="Actions"
                                fixed="right"
                                width={150}
                                render={(_, record: User) => (
                                    <Space>
                                        <Tooltip title="Edit user">
                                            <Button
                                                aria-label={`Edit ${record.fname || 'user'}`}
                                                icon={<EditOutlined />}
                                                onClick={() => handleEdit(record)}
                                            />
                                        </Tooltip>

                                        <Tooltip title="Change password">
                                            <ChangePassword data={record} onSuccess={() => refetch()} />
                                        </Tooltip>

                                        <Popconfirm
                                            title="Delete user?"
                                            description={`Remove the account for ${record.fname || 'this user'}? This cannot be undone.`}
                                            onConfirm={() => handleDelete(record.id)}
                                            okText="Delete user"
                                            okButtonProps={{ danger: true }}
                                            cancelText="Cancel"
                                        >
                                            <Button
                                                danger
                                                title="Delete user"
                                                aria-label={`Delete ${record.fname || 'user'}`}
                                                icon={<Trash size={15} />}
                                            />
                                        </Popconfirm>
                                    </Space>
                                )}
                            />
                        </Table>

                        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                            <Pagination
                                current={page}
                                pageSize={perPage}
                                total={data?.total}
                                showSizeChanger
                                responsive
                                showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} users`}
                                onChange={(p, ps) => {
                                    setPage(p);
                                    setPerPage(ps);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ModalCreateEditUser
                user={user}
                modalOpen={open}
                form={form}
                onClose={() => {
                    setOpen(false);
                }}
                refetch={() => {
                    refetch();
                }}
            />
        </>
    );
};

AdminUsersPage.layout = (page: ReactElement<SharedData>) => <AdminAuthLayout user={page.props.auth.user}>{page}</AdminAuthLayout>;
export default AdminUsersPage;
