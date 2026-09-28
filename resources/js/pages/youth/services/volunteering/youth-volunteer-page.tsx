import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { Alert, App, Button, Empty, Form, Input, Modal, Skeleton, Tag } from 'antd';
import axios from 'axios';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  HandHeart,
  MapPin,
  Send,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react';

type MyAssignment = {
  id: number;
  activity_title: string | null;
  activity_category: string | null;
  activity_starts_at: string | null;
  venue_name: string | null;
  role: string | null;
  status: 'assigned' | 'completed' | 'cancelled';
  hours_rendered: number | null;
};

type OpenActivity = {
  id: number;
  title: string;
  venue_name: string;
  starts_at: string | null;
  is_featured: boolean;
};

type MyVolunteering = {
  profile: { fname: string | null; lname: string | null; email: string | null };
  volunteer: {
    id: number;
    status: 'pending' | 'active' | 'inactive';
    skills: string | null;
    motivation: string | null;
    registered_at: string | null;
    total_hours: number;
    assignments_count: number;
  } | null;
  assignments: MyAssignment[];
  open_activities: OpenActivity[];
};

type RegistrationValues = {
  motivation: string;
  skills?: string;
  availability?: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
};

const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' });

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Date to be announced';

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? 'Date to be announced' : dateTimeFormatter.format(parsed);
};

const formatHours = (value: number) =>
  `${value.toLocaleString('en-PH', { maximumFractionDigits: 2 })} ${value === 1 ? 'hour' : 'hours'}`;

const statusCopy = {
  pending: {
    title: 'Your application is under review',
    body: 'The MYDO is reviewing your volunteer application. You will be able to get assigned to activities once it is approved.',
  },
  active: {
    title: 'You are an active volunteer',
    body: 'Thank you for serving the community. Keep showing up — your hours build your service record.',
  },
  inactive: {
    title: 'Your volunteer record is inactive',
    body: 'Your service hours are kept, but you are not being assigned new activities right now. Contact the MYDO to reactivate.',
  },
} as const;

const YouthVolunteerPage = () => {
  const { notification } = App.useApp();

  const [form] = Form.useForm<RegistrationValues>();
  const [data, setData] = useState<MyVolunteering>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const res = await axios.get<MyVolunteering>('/youth/services/get-my-volunteering');

      setData(res.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, retry]);

  const onFinish = async (values: RegistrationValues) => {
    setSubmitting(true);
    setFormErrors({});

    try {
      await axios.post('/youth/services/volunteer', {
        motivation: values.motivation.trim(),
        skills: values.skills?.trim() || null,
        availability: values.availability?.trim() || null,
        emergency_contact_name: values.emergency_contact_name.trim(),
        emergency_contact_number: values.emergency_contact_number.trim(),
      });

      notification.success({
        message: 'Application submitted',
        description: 'The MYDO will review your volunteer application.',
        placement: 'topRight',
      });

      setRegisterOpen(false);
      form.resetFields();
      await loadData();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setFormErrors(err.response.data.errors ?? {});
      }

      const description = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.';

      notification.error({ message: 'Could not submit your application', description, placement: 'topRight' });
    } finally {
      setSubmitting(false);
    }
  };

  const volunteer = data?.volunteer ?? null;
  const assignments = data?.assignments ?? [];
  const statusMessage = volunteer ? statusCopy[volunteer.status] : null;

  return (
    <>
      <Head title="Volunteer" />

      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-teal-700 uppercase">Youth services / Community</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Give your time</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              Volunteer for programs in your barangay and build a service record that shows your commitment to the community.
            </p>
          </div>

          {!volunteer && (
            <Button
              type="primary"
              size="large"
              icon={<HandHeart size={17} />}
              onClick={() => setRegisterOpen(true)}
              className="w-full sm:w-auto"
              loading={loading}
            >
              Become a volunteer
            </Button>
          )}
        </header>

        {loadError ? (
          <Alert
            type="error"
            showIcon
            title="Unable to load your volunteering record"
            description="Please try again to see your service hours."
            action={
              <Button onClick={() => setRetry((value) => value + 1)} loading={loading}>
                Try again
              </Button>
            }
          />
        ) : loading ? (
          <div aria-label="Loading your volunteering record" aria-busy="true" className="grid gap-4">
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : volunteer ? (
          <>
            <section aria-label="Your volunteer status" className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium text-stone-500">Service hours</p>
                <p className="mt-2 text-3xl leading-none font-semibold text-teal-800 tabular-nums">
                  {volunteer.total_hours.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                </p>
                <p className="mt-2 text-xs text-stone-400">Hours credited so far</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium text-stone-500">Activities</p>
                <p className="mt-2 text-3xl leading-none font-semibold text-stone-950 tabular-nums">{assignments.length}</p>
                <p className="mt-2 text-xs text-stone-400">You have been assigned to</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium text-stone-500">Status</p>
                <p className="mt-2 text-lg leading-7 font-semibold text-stone-950 capitalize">{volunteer.status}</p>
                <p className="mt-2 text-xs text-stone-400">
                  {volunteer.registered_at ? `Since ${formatDate(volunteer.registered_at)}` : 'Registration recorded'}
                </p>
              </div>
            </section>

            {statusMessage && (
              <Alert
                type={volunteer.status === 'active' ? 'success' : volunteer.status === 'pending' ? 'info' : 'warning'}
                showIcon
                icon={volunteer.status === 'active' ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                message={statusMessage.title}
                description={statusMessage.body}
              />
            )}

            <section aria-labelledby="my-assignments-heading">
              <h2 id="my-assignments-heading" className="text-lg font-semibold text-stone-900">
                My assignments
              </h2>
              <p className="mt-1 text-sm text-stone-500">Activities you have been assigned to as a volunteer.</p>

              <div className="mt-4">
                {assignments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <p className="font-semibold text-stone-800">No assignments yet</p>
                          <p className="mt-2 text-sm text-stone-500">
                            The MYDO assigns volunteers to activities. You will see them listed here once that happens.
                          </p>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <ul className="grid gap-4">
                    {assignments.map((assignment) => (
                      <li
                        key={assignment.id}
                        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-300"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-base leading-6 font-semibold break-words text-stone-900">
                              {assignment.activity_title ?? 'Community activity'}
                            </h3>

                            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={13} aria-hidden="true" />
                                {formatDateTime(assignment.activity_starts_at)}
                              </span>
                              {assignment.venue_name && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin size={13} aria-hidden="true" />
                                  {assignment.venue_name}
                                </span>
                              )}
                              {assignment.role && <Tag className="!m-0">{assignment.role}</Tag>}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                              <Clock size={12} aria-hidden="true" />
                              {assignment.hours_rendered === null
                                ? 'Hours pending'
                                : formatHours(assignment.hours_rendered)}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                                assignment.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : assignment.status === 'cancelled'
                                    ? 'bg-stone-100 text-stone-500'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {volunteer.motivation && (
              <section aria-labelledby="my-motivation-heading" className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 id="my-motivation-heading" className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <ClipboardCheck size={15} className="text-teal-700" aria-hidden="true" />
                  My motivation
                </h2>
                <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-stone-600">{volunteer.motivation}</p>
              </section>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <HandHeart size={26} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-stone-900">You are not registered as a volunteer yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Sign up and the MYDO will review your application. Once approved, you can be assigned to community activities and start earning
              service hours.
            </p>
            <Button type="primary" size="large" icon={<HandHeart size={16} />} className="mt-6" onClick={() => setRegisterOpen(true)}>
              Become a volunteer
            </Button>
          </div>
        )}

        {(data?.open_activities.length ?? 0) > 0 && (
          <section aria-labelledby="open-activities-heading">
            <h2 id="open-activities-heading" className="text-lg font-semibold text-stone-900">
              Activities needing volunteers
            </h2>
            <p className="mt-1 text-sm text-stone-500">Programs the MYDO is currently looking for volunteers for.</p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {data?.open_activities.map((activity) => (
                <li key={activity.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm leading-6 font-semibold break-words text-stone-900">{activity.title}</h3>
                    {activity.is_featured && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        <Award size={11} aria-hidden="true" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={12} aria-hidden="true" />
                      {formatDate(activity.starts_at) ?? 'Date to be announced'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={12} aria-hidden="true" />
                      {activity.venue_name}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <Modal
        forceRender
        open={registerOpen}
        width={640}
        centered
        title={
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
              <HandHeart size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold text-stone-900">Become a volunteer</span>
              <span className="mt-0.5 block text-xs font-normal text-stone-500">The MYDO reviews every application before assigning work.</span>
            </span>
          </div>
        }
        okText="Submit application"
        cancelText="Cancel"
        onCancel={() => {
          if (!submitting) setRegisterOpen(false);
        }}
        okButtonProps={{ htmlType: 'submit', loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
        maskClosable={!submitting}
        closable={!submitting}
        destroyOnHidden
        modalRender={(dom) => (
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            onFinish={onFinish}
            requiredMark
            initialValues={{ motivation: '', skills: '', availability: '', emergency_contact_name: '', emergency_contact_number: '' }}
          >
            {dom}
          </Form>
        )}
      >
        <div className="flex flex-col gap-1 pt-2">
          <Form.Item
            name="motivation"
            label="Why do you want to volunteer?"
            className="mb-4"
            validateStatus={formErrors.motivation ? 'error' : ''}
            help={formErrors.motivation?.[0]}
            rules={[
              { required: true, whitespace: true, message: 'Tell us why you want to volunteer.' },
              { min: 10, message: 'Please write at least 10 characters.' },
            ]}
          >
            <Input.TextArea
              tabIndex={1}
              rows={4}
              maxLength={2000}
              showCount
              placeholder="e.g. I want to help keep our barangay clean and meet people in my community."
              disabled={submitting}
            />
          </Form.Item>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="skills"
              label="Skills"
              className="mb-0"
              validateStatus={formErrors.skills ? 'error' : ''}
              help={formErrors.skills?.[0] ?? 'Optional.'}
              rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
            >
              <Input tabIndex={2} placeholder="e.g. First aid, driving" disabled={submitting} />
            </Form.Item>

            <Form.Item
              name="availability"
              label="Availability"
              className="mb-0"
              validateStatus={formErrors.availability ? 'error' : ''}
              help={formErrors.availability?.[0] ?? 'Optional.'}
              rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
            >
              <Input tabIndex={3} placeholder="e.g. Weekends" disabled={submitting} />
            </Form.Item>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="emergency_contact_name"
              label="Emergency contact"
              className="mb-0"
              validateStatus={formErrors.emergency_contact_name ? 'error' : ''}
              help={formErrors.emergency_contact_name?.[0]}
              rules={[{ required: true, message: 'Enter an emergency contact name.' }]}
            >
              <Input tabIndex={4} placeholder="Full name" disabled={submitting} />
            </Form.Item>

            <Form.Item
              name="emergency_contact_number"
              label="Contact number"
              className="mb-0"
              validateStatus={formErrors.emergency_contact_number ? 'error' : ''}
              help={formErrors.emergency_contact_number?.[0]}
              rules={[{ required: true, message: 'Enter an emergency contact number.' }]}
            >
              <Input tabIndex={5} placeholder="09XX XXX XXXX" disabled={submitting} />
            </Form.Item>
          </div>

          <div className="mt-2 flex items-start gap-2 rounded-xl border border-teal-100 bg-teal-50 p-3">
            <Users size={15} className="mt-0.5 shrink-0 text-teal-700" />
            <p className="text-xs leading-5 text-teal-900">
              Your application starts as pending. The MYDO will review it and contact you before you are assigned to any activity.
            </p>
          </div>

          {formErrors.motivation?.length ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
              <TriangleAlert size={13} aria-hidden="true" />
              Please fix the highlighted fields before submitting.
            </p>
          ) : null}

          <div className="mt-4 flex justify-end">
            <Button type="primary" htmlType="submit" icon={<Send size={15} />} loading={submitting}>
              Submit application
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

YouthVolunteerPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);

export default YouthVolunteerPage;
