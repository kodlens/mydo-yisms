import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData, Student } from '@/types';
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
import { App, Button, Descriptions, Empty, Space, Tag } from 'antd';
import { ReactElement, ReactNode, useState } from 'react';

type DocumentItem = {
  key: string;
  label: string;
  path: string | null;
  url: string | null;
  exists: boolean;
};

type Props = {
  applicant: Student;
  documents: DocumentItem[];
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

const fullName = (applicant: Student) =>
  [applicant.fname, applicant.mname, applicant.lname, applicant.suffix].filter(Boolean).join(' ');

const addressLabel = (name: unknown, code: unknown) => {
  const displayName = valueOrDash(name);
  const displayCode = valueOrDash(code);

  if (displayName === '-') {
    return displayCode;
  }

  if (displayCode === '-') {
    return displayName;
  }

  return `${displayName} (${displayCode})`;
};

const StaffApplicantShow = ({ applicant, documents }: Props) => {
  const { modal, notification } = App.useApp();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const status = valueOrDash(applicant.registration_status).toLowerCase();

  const updateStatus = (nextStatus: 'pending' | 'approved' | 'rejected') => {
    const title =
      nextStatus === 'approved'
        ? 'Approve application?'
        : nextStatus === 'rejected'
          ? 'Reject application?'
          : 'Mark as pending?';

    modal.confirm({
      title,
      content: `This will set ${fullName(applicant)}'s application status to ${nextStatus}.`,
      okText: nextStatus === 'approved' ? 'Approve' : nextStatus === 'rejected' ? 'Reject' : 'Mark pending',
      okButtonProps: {
        danger: nextStatus === 'rejected',
      },
      onOk: () => {
        setUpdatingStatus(nextStatus);

        router.patch(
          `/staff/applicants/${applicant.id}/status`,
          { registration_status: nextStatus },
          {
            preserveScroll: true,
            onSuccess: () => {
              notification.success({
                message: 'Status updated',
                description: `Application is now ${nextStatus}.`,
                placement: 'topRight',
              });
            },
            onError: () => {
              notification.error({
                message: 'Unable to update status',
                description: 'Please refresh the page and try again.',
                placement: 'topRight',
              });
            },
            onFinish: () => setUpdatingStatus(null),
          },
        );
      },
    });
  };

  return (
    <>
      <Head title={`Applicant ${applicant.id}`} />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div>
          <Link
            href="/staff/applicants"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950"
          >
            <ArrowLeftOutlined />
            Back to applicants
          </Link>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start gap-4 border-b border-stone-200 px-6 py-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700">
              <IdcardOutlined className="text-xl" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">Applicant Profile</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-950">{fullName(applicant)}</h1>
              <p className="mt-1 text-sm text-stone-500">Application #{applicant.id}</p>
            </div>

            <div className="ml-auto">
              <Tag color={statusColor[status] ?? 'default'} className="px-3 py-1 text-sm capitalize">
                {status}
              </Tag>
            </div>
          </div>

          <div className="border-b border-stone-200 bg-stone-50 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Space wrap>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={updatingStatus === 'approved'}
                  disabled={status === 'approved' || updatingStatus !== null}
                  onClick={() => updateStatus('approved')}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={updatingStatus === 'rejected'}
                  disabled={status === 'rejected' || updatingStatus !== null}
                  onClick={() => updateStatus('rejected')}
                >
                  Reject
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  loading={updatingStatus === 'pending'}
                  disabled={status === 'pending' || updatingStatus !== null}
                  onClick={() => updateStatus('pending')}
                >
                  Mark Pending
                </Button>
              </Space>
            </div>
          </div>

          <div className="grid gap-5 p-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <InfoPanel title="Personal Information" icon={<UserOutlined />}>
                <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label="Last name">{valueOrDash(applicant.lname)}</Descriptions.Item>
                  <Descriptions.Item label="First name">{valueOrDash(applicant.fname)}</Descriptions.Item>
                  <Descriptions.Item label="Middle name">{valueOrDash(applicant.mname)}</Descriptions.Item>
                  <Descriptions.Item label="Suffix">{valueOrDash(applicant.suffix)}</Descriptions.Item>
                  <Descriptions.Item label="Birth date">{valueOrDash(applicant.birth_date)}</Descriptions.Item>
                  <Descriptions.Item label="Sex">{valueOrDash(applicant.sex)}</Descriptions.Item>
                  <Descriptions.Item label="Civil status">{valueOrDash(applicant.civil_status)}</Descriptions.Item>
                  <Descriptions.Item label="Email">{valueOrDash(applicant.email)}</Descriptions.Item>
                  <Descriptions.Item label="Mobile">{valueOrDash(applicant.mobile_number)}</Descriptions.Item>
                </Descriptions>
              </InfoPanel>

              <InfoPanel title="Address" icon={<HomeOutlined />}>
                <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label="Province">
                    {addressLabel(applicant.province?.provDesc, applicant.provCode)}
                  </Descriptions.Item>
                  <Descriptions.Item label="City / municipality">
                    {addressLabel(applicant.city?.citymunDesc, applicant.citymunCode)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Barangay">
                    {addressLabel(applicant.barangay?.brgyDesc, applicant.brgyCode)}
                  </Descriptions.Item>
                  <Descriptions.Item label="ZIP code">{valueOrDash(applicant.zip_code)}</Descriptions.Item>
                  <Descriptions.Item label="Street address" span={2}>
                    {valueOrDash(applicant.street_address)}
                  </Descriptions.Item>
                </Descriptions>
              </InfoPanel>

              <InfoPanel title="Education" icon={<BankOutlined />}>
                <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label="School">{valueOrDash(applicant.school_name)}</Descriptions.Item>
                  <Descriptions.Item label="Program">{valueOrDash(applicant.program)}</Descriptions.Item>
                  <Descriptions.Item label="Year">{valueOrDash(applicant.year)}</Descriptions.Item>
                  <Descriptions.Item label="Previous GWA">{valueOrDash(applicant.previous_semester_gwa)}</Descriptions.Item>
                </Descriptions>
              </InfoPanel>

              <InfoPanel title="Guardian" icon={<PhoneOutlined />}>
                <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label="Guardian name">{valueOrDash(applicant.guardian_name)}</Descriptions.Item>
                  <Descriptions.Item label="Guardian contact">{valueOrDash(applicant.guardian_contact_number)}</Descriptions.Item>
                  <Descriptions.Item label="Monthly family income">{valueOrDash(applicant.monthly_family_income)}</Descriptions.Item>
                </Descriptions>
              </InfoPanel>
            </div>

            <InfoPanel title="Documents" icon={<FileTextOutlined />}>
              <div className="space-y-3">
                {documents.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents" />}

                {documents.map((document) => (
                  <div key={document.key} className="rounded-lg border border-stone-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">{document.label}</p>
                        <p className="mt-1 truncate text-xs text-stone-500">{document.path ?? 'No file uploaded'}</p>
                      </div>
                      <Tag color={document.exists ? 'green' : 'default'}>{document.exists ? 'Ready' : 'Missing'}</Tag>
                    </div>

                    <Button
                      className="mt-3 w-full"
                      href={document.url ?? undefined}
                      target="_blank"
                      disabled={!document.exists || !document.url}
                    >
                      Open document
                    </Button>
                  </div>
                ))}
              </div>
            </InfoPanel>
          </div>
        </section>
      </div>
    </>
  );
};

function InfoPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-green-700">{icon}</span>
        <h2 className="text-base font-semibold text-stone-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

StaffApplicantShow.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffApplicantShow;
