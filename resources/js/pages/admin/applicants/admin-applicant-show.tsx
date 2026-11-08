import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData, Youth } from '@/types';
import {
  ArrowLeftOutlined,
  BankOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  HomeOutlined,
  IdcardOutlined,
  PhoneOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Head, Link, router } from '@inertiajs/react';
import { App, Button, Descriptions, Form, Input, Modal, Space, Tag } from 'antd';
import { ReactElement, ReactNode, useState } from 'react';

type Props = {
  applicant: Youth;
};

const statusColor: Record<string, string> = {
  approved: 'green',
  pending: 'gold',
  draft: 'default',
  rejected: 'red',
};

const valueOrDash = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return String(value);
};

const formatDate = (value: unknown) => {
  if (!value) {
    return '-';
  }

  const rawDate = String(value).slice(0, 10);
  const [year, month, day] = rawDate.split('-');

  if (!year || !month || !day) {
    return valueOrDash(value);
  }

  const monthName = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleString('en-US', {
    month: 'short',
  });

  return `${monthName} ${day}, ${year}`;
};

const fullName = (applicant: Youth) =>
  [applicant.fname, applicant.mname, applicant.lname, applicant.suffix].filter(Boolean).join(' ');

const addressLabel = (name: unknown) => {
  const displayName = valueOrDash(name);
  return `${displayName}`;
};

const AdminApplicantShow = ({ applicant }: Props) => {
  const { modal, notification } = App.useApp();
  const [rejectForm] = Form.useForm<{ rejection_reason: string }>();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const status = valueOrDash(applicant.registration_status).toLowerCase();

  const saveStatus = (nextStatus: 'pending' | 'approved' | 'rejected', rejectionReason?: string) => {
    setUpdatingStatus(nextStatus);

    router.patch(
      `/admin/applicants/${applicant.id}/status`,
      { registration_status: nextStatus, rejection_reason: rejectionReason },
      {
        preserveScroll: true,
        onSuccess: () => {
          notification.success({
            message: 'Status updated',
            description: `Application is now ${nextStatus}.`,
            placement: 'topRight',
          });
          setRejectOpen(false);
          rejectForm.resetFields();
        },
        onError: (errors) => {
          if (errors.rejection_reason) {
            rejectForm.setFields([{ name: 'rejection_reason', errors: [errors.rejection_reason] }]);
          }

          notification.error({
            message: 'Unable to update status',
            description: 'Please check the form and try again.',
            placement: 'topRight',
          });
        },
        onFinish: () => setUpdatingStatus(null),
      },
    );
  };

  const updateStatus = (nextStatus: 'pending' | 'approved') => {
    const title =
      nextStatus === 'approved'
        ? 'Approve application?'
        : 'Mark as pending?';

    modal.confirm({
      title,
      content: `This will set ${fullName(applicant)}'s application status to ${nextStatus}.`,
      okText: nextStatus === 'approved' ? 'Approve' : 'Mark pending',
      onOk: () => saveStatus(nextStatus),
    });
  };

  const openRejectModal = () => {
    rejectForm.setFieldsValue({ rejection_reason: applicant.rejection_reason ?? '' });
    setRejectOpen(true);
  };

  return (
    <>
      <Head title={`Scholarship Application ${applicant.id} (Admin)`} />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/applicants"
            className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            <ArrowLeftOutlined /> Back to applicants
          </Link>

          <Space wrap>
            {status !== 'pending' && (
              <Button
                icon={<SyncOutlined />}
                loading={updatingStatus === 'pending'}
                onClick={() => updateStatus('pending')}
              >
                Mark Pending
              </Button>
            )}

            {status !== 'approved' && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={updatingStatus === 'approved'}
                onClick={() => updateStatus('approved')}
                className="!bg-green-700 hover:!bg-green-800"
              >
                Approve Application
              </Button>
            )}

            {status !== 'rejected' && (
              <Button danger icon={<CloseOutlined />} onClick={openRejectModal}>
                Reject Application
              </Button>
            )}
          </Space>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700">
                <IdcardOutlined className="text-xl" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">Application #{applicant.id}</p>
                <h1 className="mt-1 text-2xl font-semibold text-stone-950">{fullName(applicant)}</h1>
                <p className="mt-1 text-sm text-stone-500">
                  Submitted {formatDate(applicant.submitted_at)}
                  {applicant.reviewed_at ? ` • Reviewed ${formatDate(applicant.reviewed_at)}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-stone-500">Status</span>
              <Tag color={statusColor[status] ?? 'default'} className="px-3 py-1 text-sm capitalize">
                {status || 'draft'}
              </Tag>
            </div>
          </div>

          {status === 'rejected' && applicant.rejection_reason && (
            <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800">
              <p className="font-semibold">Rejection reason</p>
              <p className="mt-1">{applicant.rejection_reason}</p>
            </div>
          )}

          <div className="space-y-8 p-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-stone-900">
                <UserOutlined className="text-green-700" />
                <h2 className="text-base font-semibold">Personal Information</h2>
              </div>
              <Descriptions
                bordered
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="[&_.ant-descriptions-item-label]:bg-stone-50 [&_.ant-descriptions-item-label]:font-medium [&_.ant-descriptions-item-label]:text-stone-600"
              >
                <Descriptions.Item label="Full name">{valueOrDash(fullName(applicant))}</Descriptions.Item>
                <Descriptions.Item label="Birth date">{formatDate(applicant.birth_date)}</Descriptions.Item>
                <Descriptions.Item label="Sex">{valueOrDash(applicant.sex)}</Descriptions.Item>
                <Descriptions.Item label="Civil status">{valueOrDash(applicant.civil_status)}</Descriptions.Item>
                <Descriptions.Item label="Guardian name">{valueOrDash(applicant.guardian_name)}</Descriptions.Item>
                <Descriptions.Item label="Guardian contact">{valueOrDash(applicant.guardian_contact_number)}</Descriptions.Item>
                <Descriptions.Item label="Monthly family income">
                  {applicant.monthly_family_income ? `₱${Number(applicant.monthly_family_income).toLocaleString()}` : '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-stone-900">
                <PhoneOutlined className="text-green-700" />
                <h2 className="text-base font-semibold">Contact Details</h2>
              </div>
              <Descriptions
                bordered
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="[&_.ant-descriptions-item-label]:bg-stone-50 [&_.ant-descriptions-item-label]:font-medium [&_.ant-descriptions-item-label]:text-stone-600"
              >
                <Descriptions.Item label="Email address">{valueOrDash(applicant.email)}</Descriptions.Item>
                <Descriptions.Item label="Mobile number">{valueOrDash(applicant.mobile_number)}</Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-stone-900">
                <HomeOutlined className="text-green-700" />
                <h2 className="text-base font-semibold">Address Details</h2>
              </div>
              <Descriptions
                bordered
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="[&_.ant-descriptions-item-label]:bg-stone-50 [&_.ant-descriptions-item-label]:font-medium [&_.ant-descriptions-item-label]:text-stone-600"
              >
                <Descriptions.Item label="Street address">{valueOrDash(applicant.street_address)}</Descriptions.Item>
                <Descriptions.Item label="Barangay">{addressLabel(applicant.barangay?.brgyDesc)}</Descriptions.Item>
                <Descriptions.Item label="City / Municipality">{addressLabel(applicant.city?.citymunDesc)}</Descriptions.Item>
                <Descriptions.Item label="Province">{addressLabel(applicant.province?.provDesc)}</Descriptions.Item>
                <Descriptions.Item label="ZIP code">{valueOrDash(applicant.zip_code)}</Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-stone-900">
                <BankOutlined className="text-green-700" />
                <h2 className="text-base font-semibold">Academic Profile</h2>
              </div>
              <Descriptions
                bordered
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="[&_.ant-descriptions-item-label]:bg-stone-50 [&_.ant-descriptions-item-label]:font-medium [&_.ant-descriptions-item-label]:text-stone-600"
              >
                <Descriptions.Item label="School / University" span={2}>
                  {valueOrDash(applicant.school_name)}
                </Descriptions.Item>
                <Descriptions.Item label="Program / Course">{valueOrDash(applicant.program)}</Descriptions.Item>
                <Descriptions.Item label="Year level">{valueOrDash(applicant.year)}</Descriptions.Item>
                <Descriptions.Item label="Previous GWA">{valueOrDash(applicant.previous_semester_gwa)}</Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-stone-900">
                <FileTextOutlined className="text-green-700" />
                <h2 className="text-base font-semibold">Submitted Documents</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Certificate of Enrollment', url: applicant.coe_path },
                  { label: 'Certificate of Grades', url: applicant.cog_path },
                  { label: 'Community Tax Certificate (Cedula)', url: applicant.cedula_path },
                  { label: 'School ID', url: applicant.school_id_path },
                ].map(({ label, url }) => (
                  <div key={label} className="flex flex-col justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
                      <p className="mt-2 text-sm font-medium text-stone-900">{url ? 'Document uploaded' : 'Not provided'}</p>
                    </div>

                    <div className="mt-4">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-medium text-green-700 hover:text-green-900"
                        >
                          View document ↗
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={rejectOpen}
        title="Reject Application"
        okText="Reject application"
        okButtonProps={{ danger: true, loading: updatingStatus === 'rejected' }}
        cancelText="Cancel"
        onCancel={() => {
          setRejectOpen(false);
          rejectForm.resetFields();
        }}
        onOk={() => {
          rejectForm.validateFields().then((values) => {
            saveStatus('rejected', values.rejection_reason);
          });
        }}
      >
        <p className="mb-4 text-sm text-stone-600">
          Provide the reason for rejecting {fullName(applicant)}'s application. This will be visible to staff and the applicant.
        </p>

        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejection_reason"
            label="Rejection reason"
            rules={[{ required: true, message: 'Please enter the reason for rejection.' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g., Incomplete requirements, low GWA, or family income exceeds the threshold."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

AdminApplicantShow.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminApplicantShow;
