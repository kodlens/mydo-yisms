import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { PaginatedResponse, SharedData, User } from '@/types';
import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  FileAddOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import {
  App,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import axios from 'axios';
import { KeyRound, Mail, MapPin, ShieldCheck, Trash, User as UserIcon } from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

const { Column } = Table;

export const SK_POSITION_OPTIONS = [
  { value: 'SK Chairperson', label: 'SK Chairperson' },
  { value: 'SK Kagawad', label: 'SK Kagawad (Councilor)' },
  { value: 'SK Secretary', label: 'SK Secretary' },
  { value: 'SK Treasurer', label: 'SK Treasurer' },
  { value: 'SK Federated President', label: 'SK Federated President' },
  { value: 'SK Federated Officer', label: 'SK Federated Officer' },
];

const StaffSkOfficialsPage = () => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSk, setEditingSk] = useState<User | undefined>();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const provCode = Form.useWatch('provCode', form) || '';
  const citymunCode = Form.useWatch('citymunCode', form) || '';

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['staff-sk-officials', perPage, page, search],
    queryFn: async () => {
      const res = await axios.get<PaginatedResponse<User>>('/staff/get-sk-officials', {
        params: { perpage: perPage, page, search },
      });
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
    setEditingSk(undefined);
    setErrors({});
    form.resetFields();
    form.setFieldsValue({
      sk_position: 'SK Chairperson',
    });
    setModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditingSk(record);
    setErrors({});
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      lname: record.lname,
      fname: record.fname,
      mname: record.mname,
      suffix: record.suffix,
      sk_position: record.sk_position || 'SK Chairperson',
      provCode: record.provCode || undefined,
      citymunCode: record.citymunCode || undefined,
      brgyCode: record.brgyCode || undefined,
      street_address: record.street_address || '',
      password: '',
      password_confirmation: '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(`/staff/sk-officials/${id}`);
      if (res.data?.success) {
        notification.success({
          message: 'Removed',
          description: res.data.message || 'SK Official account removed successfully.',
          placement: 'topRight',
        });
        refetch();
      }
    } catch {
      notification.error({
        message: 'Could not delete account',
        placement: 'topRight',
      });
    }
  };

  const handleSave = async (values: Record<string, string>) => {
    setSaving(true);
    setErrors({});
    try {
      if (editingSk) {
        await axios.put(`/staff/sk-officials/${editingSk.id}`, values);
        notification.success({
          message: 'Updated',
          description: 'SK Official account and barangay assignment updated successfully.',
          placement: 'topRight',
        });
      } else {
        await axios.post('/staff/sk-officials', values);
        notification.success({
          message: 'Registered',
          description: 'SK Official account registered! They can now sign in via the Staff / SK Portal login.',
          placement: 'topRight',
        });
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        notification.error({
          message: 'Failed to save SK Official account',
          placement: 'topRight',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head title="SK Officials Registration & Management" />

      <div className="mx-auto max-w-7xl">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-indigo-700 via-emerald-600 to-teal-600" />
          <div className="border-b border-slate-100 px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">
                  MYDO Staff Workspace
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Sangguniang Kabataan (SK) Officials
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Register and manage SK Official login accounts along with their position and assigned barangay.
                </p>
              </div>

              <div className="w-full rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4 sm:ml-auto sm:w-auto sm:min-w-36">
                <p className="text-xs font-medium text-indigo-800">
                  {search ? 'Matching SK Officials' : 'Total SK Officials'}
                </p>
                <p className="mt-2 text-3xl leading-none font-semibold text-indigo-950 tabular-nums">
                  {data ? data.total.toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">SK Official Accounts Directory</h2>
                <p className="mt-1 text-sm text-slate-500">
                  View each SK Official&apos;s leadership position, barangay jurisdiction, and login credentials.
                </p>
              </div>
              <Button
                className="w-full sm:w-auto !bg-emerald-700 hover:!bg-emerald-800"
                size="large"
                type="primary"
                icon={<FileAddOutlined />}
                onClick={handleNew}
              >
                Register SK Official
              </Button>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <label htmlFor="sk-search" className="mb-2 block text-xs font-medium text-slate-600">
                Find an SK Official
              </label>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  id="sk-search"
                  size="large"
                  value={searchInput}
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Search by name, username, email, position, or barangay"
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

            <Table<User>
              size="large"
              tableLayout="fixed"
              className="overflow-hidden rounded-xl border border-slate-200 [&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-slate-600"
              rowKey="id"
              loading={isFetching}
              pagination={false}
              dataSource={Array.isArray(data?.data) ? data.data : []}
              rowClassName={() => 'hover:bg-slate-50'}
              scroll={{ x: 1080 }}
              locale={{
                emptyText: isFetching ? (
                  'Loading SK Officials...'
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-slate-700">
                          {search ? 'No matching SK Officials' : 'No SK Officials registered yet'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {search
                            ? 'Try another name or barangay, or clear your search.'
                            : 'Click "Register SK Official" to create an account.'}
                        </p>
                      </div>
                    }
                  />
                ),
              }}
            >
              <Column<User>
                title="SK Official"
                key="name"
                width={240}
                render={(_, row) => (
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-800">
                      {`${row.fname?.[0] ?? ''}${row.lname?.[0] ?? ''}`.toUpperCase() || 'SK'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold break-words text-slate-900">
                        {[row.lname, [row.fname, row.mname, row.suffix].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
                          'Name not provided'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 tabular-nums">ID #{row.id}</p>
                    </div>
                  </div>
                )}
              />

              <Column<User>
                title="Position"
                key="sk_position"
                width={175}
                render={(_, row) => (
                  <Tag color="geekblue" className="font-semibold">
                    <ShieldCheck className="mr-1 inline h-3 w-3" />
                    {row.sk_position || 'SK Official'}
                  </Tag>
                )}
              />

              <Column<User>
                title="Assigned Barangay"
                key="barangay"
                width={230}
                render={(_, row) =>
                  row.barangay?.brgyDesc ? (
                    <Tooltip
                      title={
                        [row.street_address, `Brgy. ${row.barangay.brgyDesc}`, row.city?.citymunDesc, row.province?.provDesc]
                          .filter(Boolean)
                          .join(', ')
                      }
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
                          <MapPin size={14} className="shrink-0 text-emerald-600" />
                          <span className="truncate">Brgy. {row.barangay.brgyDesc}</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {[row.city?.citymunDesc, row.province?.provDesc].filter(Boolean).join(', ') || row.street_address || '—'}
                        </p>
                      </div>
                    </Tooltip>
                  ) : (
                    <span className="text-xs italic text-slate-400">Not assigned yet</span>
                  )
                }
              />

              <Column<User>
                title="Login Username"
                dataIndex="username"
                width={150}
                render={(value) => (
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                    {value || '—'}
                  </code>
                )}
              />

              <Column<User>
                title="Email"
                dataIndex="email"
                width={210}
                ellipsis={{ showTitle: false }}
                render={(email: string) => (
                  <Tooltip title={email}>
                    <span className="block truncate text-sm text-slate-600">{email || 'Not provided'}</span>
                  </Tooltip>
                )}
              />

              <Column<User>
                title="Actions"
                fixed="right"
                width={120}
                render={(_, record) => (
                  <Space>
                    <Tooltip title="Edit SK Official">
                      <Button
                        aria-label={`Edit ${record.fname || 'SK Official'}`}
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      />
                    </Tooltip>

                    <Popconfirm
                      title="Delete SK Official account?"
                      description={`Remove the SK account for ${record.fname || 'this official'}?`}
                      onConfirm={() => handleDelete(record.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                    >
                      <Button
                        danger
                        aria-label={`Delete ${record.fname || 'SK Official'}`}
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
                showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} SK Officials`}
                onChange={(p, ps) => {
                  setPage(p);
                  setPerPage(ps);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        forceRender
        open={modalOpen}
        width={740}
        title={editingSk ? 'Edit SK Official Account' : 'Register New SK Official'}
        okText={editingSk ? 'Update Account' : 'Register SK Official'}
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ htmlType: 'submit', loading: saving }}
        destroyOnHidden
        modalRender={(dom) => (
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={handleSave}
            onValuesChange={(changedValues) => {
              if ('provCode' in changedValues) {
                form.setFieldsValue({ citymunCode: undefined, brgyCode: undefined });
              } else if ('citymunCode' in changedValues) {
                form.setFieldsValue({ brgyCode: undefined });
              }
            }}
          >
            {dom}
          </Form>
        )}
      >
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="username"
              label="Login Username"
              validateStatus={errors.username ? 'error' : undefined}
              help={errors.username?.[0]}
              rules={[{ required: true, message: 'Username is required for login.' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="e.g. sk_carlo" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              validateStatus={errors.email ? 'error' : undefined}
              help={errors.email?.[0]}
              rules={[{ required: true, message: 'Email is required.' }]}
            >
              <Input prefix={<Mail size={15} />} placeholder="e.g. carlo@mail.com" />
            </Form.Item>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Form.Item
              name="lname"
              label="Last Name"
              validateStatus={errors.lname ? 'error' : undefined}
              help={errors.lname?.[0]}
              rules={[{ required: true, message: 'Last name is required.' }]}
            >
              <Input prefix={<UserIcon size={15} />} placeholder="e.g. Bautista" />
            </Form.Item>

            <Form.Item
              name="fname"
              label="First Name"
              validateStatus={errors.fname ? 'error' : undefined}
              help={errors.fname?.[0]}
              rules={[{ required: true, message: 'First name is required.' }]}
            >
              <Input prefix={<UserIcon size={15} />} placeholder="e.g. Carlo" />
            </Form.Item>

            <Form.Item name="mname" label="Middle Name (Optional)">
              <Input prefix={<UserIcon size={15} />} placeholder="e.g. Reyes" />
            </Form.Item>
          </div>

          {/* SK Leadership & Barangay Assignment */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin size={15} className="text-emerald-700" />
              <p className="text-xs font-bold tracking-wide text-emerald-950 uppercase">
                SK Position &amp; Barangay Jurisdiction
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="sk_position"
                label="SK Position"
                validateStatus={errors.sk_position ? 'error' : undefined}
                help={errors.sk_position?.[0]}
                rules={[{ required: true, message: 'Please select the SK position.' }]}
              >
                <Select
                  placeholder="Select SK Position"
                  options={SK_POSITION_OPTIONS}
                />
              </Form.Item>

              <Form.Item
                name="provCode"
                label="Province"
                validateStatus={errors.provCode ? 'error' : undefined}
                help={errors.provCode?.[0]}
                rules={[{ required: true, message: 'Province is required.' }]}
              >
                <SelectProvince />
              </Form.Item>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="citymunCode"
                label="City / Municipality"
                validateStatus={errors.citymunCode ? 'error' : undefined}
                help={errors.citymunCode?.[0]}
                rules={[{ required: true, message: 'City / Municipality is required.' }]}
              >
                <SelectCity provinceCode={provCode} />
              </Form.Item>

              <Form.Item
                name="brgyCode"
                label="Barangay Leading"
                validateStatus={errors.brgyCode ? 'error' : undefined}
                help={errors.brgyCode?.[0]}
                rules={[{ required: true, message: 'Assigned barangay is required.' }]}
              >
                <SelectBarangay provinceCode={provCode} cityCode={citymunCode} />
              </Form.Item>
            </div>

            <Form.Item
              name="street_address"
              label="Purok / Street / Barangay Hall Address (Optional)"
              validateStatus={errors.street_address ? 'error' : undefined}
              help={errors.street_address?.[0]}
              className="mb-0"
            >
              <Input placeholder="e.g. Purok 1, Near Barangay Hall" />
            </Form.Item>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold text-slate-700">
              {editingSk
                ? 'Change Password (leave blank to keep current password)'
                : 'Set Initial Login Password'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="password"
                label="Password"
                validateStatus={errors.password ? 'error' : undefined}
                help={errors.password?.[0]}
                rules={editingSk ? [] : [{ required: true, message: 'Password is required.' }]}
                className="mb-0"
              >
                <Input.Password
                  prefix={<KeyRound size={15} />}
                  placeholder="Password"
                  iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="password_confirmation"
                label="Confirm Password"
                validateStatus={errors.password_confirmation ? 'error' : undefined}
                help={errors.password_confirmation?.[0]}
                rules={editingSk ? [] : [{ required: true, message: 'Please confirm password.' }]}
                className="mb-0"
              >
                <Input.Password
                  prefix={<KeyRound size={15} />}
                  placeholder="Confirm Password"
                  iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

StaffSkOfficialsPage.layout = (page: ReactNode) => (
  <StaffAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user}
    header="SK Officials Registration"
  >
    {page}
  </StaffAuthLayout>
);

export default StaffSkOfficialsPage;
