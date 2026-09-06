import { ReactElement, useState } from 'react'
import axios from 'axios'
import { Head } from '@inertiajs/react'
import {
  FileAddOutlined,
  EditOutlined,
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Table,
  Space,
  Pagination,
  Button,
  Input,
  App,
  Popconfirm,
  Form,
  Tag,
  Tooltip,
} from 'antd'


import { SharedData, User } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import ChangePassword from './partials/change-password'
import ModalCreateEditUser from './partials/modal-create-edit'
import AdminLayout from '@/layouts/admin-layout'


const { Column } = Table

const AdminUsersPage = () => {
  const [form] = Form.useForm()
  const { notification } = App.useApp()

  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User>()
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['users', perPage, page, search],
    queryFn: async () => {
      const params = [
        `perpage=${perPage}`,
        `page=${page}`,
        `search=${search}`,
      ].join('&')

      const res = await axios.get(`/admin/get-users?${params}`)
      return res.data
    }
  })

  const applySearch = (value?: string) => {
    setPage(1)
    setSearch((value ?? searchInput).trim())
  }

  const clearSearch = () => {
    setPage(1)
    setSearchInput('')
    setSearch('')
  }

  const handleNew = () => {
    setUser(undefined)
    setOpen(true)
  }

  const handleEdit = async (record: User) => {
    setUser(record)
    setOpen(true)
  }

  const handleDelete = async (userId: number) => {
    const res = await axios.delete(`/admin/users/${userId}`)
    if (res.data.status === 'deleted') {
      notification.success({
        title: 'Deleted',
        description: 'User removed successfully',
      })
      refetch()
    }
  }

  return (
    <>
      <Head title="User Management" />

      <div className="flex justify-center">
        <div className="w-full max-w-[1300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className='relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-6 py-6'>
            <div className='pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-100/60 blur-2xl' />
            <div className='pointer-events-none absolute -left-8 -bottom-14 h-36 w-36 rounded-full bg-blue-100/70 blur-2xl' />

            <div className='relative flex flex-wrap items-start gap-4'>
              <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm'>
                <TeamOutlined className='text-xl' />
              </div>

              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700'>
                  Admin Panel
                </p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-900">
                  User Management
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage user accounts, roles, and login access settings.
                </p>
              </div>

              <div className='ml-auto rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-right shadow-sm'>
                <p className='text-[11px] uppercase tracking-wide text-slate-500'>Total Users</p>
                <p className='text-2xl font-semibold leading-none text-slate-900'>{data?.total ?? 0}</p>
              </div>
            </div>
          </div>

          <div className='p-6'>
            <div className='mb-4 flex items-center gap-2 text-sm text-slate-500'>
              <FilterOutlined />
              <span>Search users by username or name fields, then manage account actions from the table.</span>
              <Button
                className='ml-auto'
                type="primary"
                icon={<FileAddOutlined />}
                onClick={handleNew}
              >
                New User
              </Button>
            </div>

            <div className='mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <div className='flex flex-col gap-3 md:flex-row'>
                <Input
                  value={searchInput}
                  prefix={<SearchOutlined className='text-slate-400' />}
                  placeholder='Search username, last name, first name...'
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applySearch()
                  }}
                  allowClear
                />
                <div className='flex gap-2'>
                  <Button onClick={clearSearch}>Clear</Button>
                  <Button type='primary' onClick={() => applySearch()}>
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <Table
              bordered
              size="middle"
              rowKey="id"
              loading={isFetching}
              pagination={false}
              dataSource={Array.isArray(data?.data) ? data?.data : []}
              rowClassName={() => 'hover:bg-slate-50'}
              scroll={{ x: 1100 }}
              locale={{
                emptyText: isFetching ? 'Loading users...' : 'No users found',
              }}
            >
              <Column title="ID" dataIndex="id" width={70} />
              <Column title="Username" dataIndex="username" width={150} />
              <Column title="Fulname" dataIndex="name" render={(_, row)=> <span>{row.lname}, {row.fname} {row.mname ?? ''}</span>} />

              <Column
                title="Email"
                dataIndex="email"
                ellipsis={{ showTitle: false }}
                render={(email: string) => (
                  <Tooltip title={email}>
                    <span className='block max-w-[220px] truncate'>{email}</span>
                  </Tooltip>
                )}
              />
              <Column
                title="Role"
                dataIndex="role"
                width={130}
                render={(role: string) => (
                  <Tag color={role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrator' ? 'blue' : role?.toLowerCase() === 'publisher' ? 'cyan' : 'geekblue'}>
                    {(role || '').toUpperCase()}
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
                    {is_ojt ? 'YES' : 'NO'}
                  </span>
                )}
              />
              <Column
                title="Action"
                width={180}
                render={(_, record: User) => (
                  <Space>
                    <Tooltip title="Edit user">
                      <Button
                        size="small"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      />
                    </Tooltip>

                    <Tooltip title="Change password">
                      <ChangePassword
                        data={record}
                        onSuccess={() => refetch()}
                      />
                    </Tooltip>

                    <Popconfirm
                      title="Delete User"
                      description="Are you sure you want to delete this user?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger icon={<Trash size={15} />} />
                    </Popconfirm>
                  </Space>
                )}
              />
            </Table>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Pagination
                current={page}
                pageSize={perPage}
                total={data?.total}
                showSizeChanger
                onChange={(p, ps) => {
                  setPage(p)
                  setPerPage(ps)
                }}
              />

              <span className="text-sm text-slate-500">
                Total users: <span className='font-semibold text-slate-700'>{data?.total || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <ModalCreateEditUser
        user={user}
        modalOpen={open}
        form={form}
        onClose={() => {
          setOpen(false)
        }}
        refetch={() => {
          refetch()
        }}
      />
    </>
  )
}

AdminUsersPage.layout = (page: ReactElement<SharedData>) => <AdminLayout user={page.props.auth.user}>{page}</AdminLayout>
export default AdminUsersPage;
