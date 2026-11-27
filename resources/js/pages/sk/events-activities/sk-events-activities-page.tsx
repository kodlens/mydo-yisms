import SkAuthLayout, { SkUser } from '@/layouts/sk-auth-layout';
import { SharedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
  App,
  Button,
  Empty,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Tag,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import axios, { isAxiosError } from 'axios';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Compass,
  FileImage,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Search,
  Sprout,
  Trash2,
  Trophy,
  UploadCloud,
  Users,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type EvidenceItem = {
  id: number;
  description: string;
  photos: string[];
  created_at: string | null;
};

type SkActivity = {
  id: number;
  title: string;
  status: string;
  category: { id: number; name: string };
  starts_at: string;
  ends_at: string;
  venue_name: string;
  venue_address: string | null;
  summary: string | null;
  description: string;
  is_featured: boolean;
  sk_evidences_count: number;
  my_evidences: EvidenceItem[];
};

const themes = {
  Leadership: { color: 'bg-indigo-950 text-indigo-100', icon: Users, label: 'LEAD THE CHANGE' },
  Environment: { color: 'bg-[#e2ecda] text-[#39563a]', icon: Sprout, label: 'GROW SOMETHING GOOD' },
  'Skills & learning': { color: 'bg-[#e8e4f5] text-[#62518e]', icon: GraduationCap, label: 'MAKE ROOM TO LEARN' },
  Sports: { color: 'bg-[#fae6cd] text-[#955820]', icon: Trophy, label: 'PLAY. CONNECT. REPEAT.' },
  Community: { color: 'bg-[#dcebf2] text-[#365f79]', icon: HeartHandshake, label: 'TOGETHER, WE DO MORE' },
};

function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleString('en-US', { ...options, timeZone: 'Asia/Manila' });
}

function activityTime(activity: SkActivity) {
  const time = { hour: 'numeric', minute: '2-digit' } as const;
  const sameDay =
    dateLabel(activity.starts_at, { dateStyle: 'short' }) === dateLabel(activity.ends_at, { dateStyle: 'short' });
  const end = dateLabel(
    activity.ends_at,
    sameDay ? time : { ...time, month: 'short', day: 'numeric', year: 'numeric' }
  );
  return dateLabel(activity.starts_at, time) + ' - ' + end;
}

function Artwork({ activity }: { activity: SkActivity }) {
  const theme = themes[activity.category?.name as keyof typeof themes] ?? themes.Community;
  const Icon = theme.icon;
  return (
    <div aria-hidden="true" className={`relative flex h-44 items-end overflow-hidden p-5 ${theme.color}`}>
      <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full border-[35px] border-current opacity-[0.07]" />
      <div className="absolute -bottom-20 left-5 h-48 w-48 rounded-full border border-current opacity-20" />
      <Icon className="absolute right-5 bottom-5 h-24 w-24 -rotate-12 opacity-20" strokeWidth={1} />
      <div className="relative">
        <Icon size={25} strokeWidth={1.5} />
        <p className="mt-4 max-w-52 text-xl leading-tight font-black tracking-tight">{theme.label}</p>
      </div>
    </div>
  );
}

const SkEventsActivitiesPage = ({
  xToken,
  activities = [],
}: {
  xToken: string;
  activities: SkActivity[];
}) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<{ description: string; photos: UploadFile[] }>();

  const [category, setCategory] = useState<string>('All activities');
  const [query, setQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<SkActivity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Sync selectedActivity with latest props when Inertia reloads
  const activeActivity = selectedActivity
    ? activities.find((a) => a.id === selectedActivity.id) ?? selectedActivity
    : null;

  const categories = ['All activities', ...new Set(activities.map((a) => a.category?.name).filter(Boolean))];
  const filtered = activities.filter(
    (item) =>
      (category === 'All activities' || item.category?.name === category) &&
      `${item.title} ${item.category?.name ?? ''} ${item.venue_name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  );

  const uploadProps: UploadProps = {
    name: 'upload',
    action: '/temp-upload',
    headers: {
      'X-CSRF-TOKEN': xToken,
    },
    listType: 'picture',
    multiple: true,
    maxCount: 10,
    accept: '.png,.jpg,.jpeg,image/png,image/jpeg',
    beforeUpload: (file) => {
      const allowedMimeTypes = ['image/png', 'image/jpeg'];
      const hasValidExtension = /\.(png|jpe?g)$/i.test(file.name);
      const isAllowedType = allowedMimeTypes.includes(file.type) && hasValidExtension;
      const isUnder5MB = file.size / 1024 / 1024 <= 5;

      if (!isAllowedType) {
        notification.error({
          message: `${file.name} is not an allowed image format`,
          placement: 'topRight',
          description: 'Strictly PNG, JPG, or JPEG pictures only.',
        });
      }

      if (!isUnder5MB) {
        notification.error({
          message: `${file.name} is too large`,
          placement: 'topRight',
          description: 'Please upload pictures not greater than 5MB each.',
        });
      }

      return (isAllowedType && isUnder5MB) || Upload.LIST_IGNORE;
    },
    onRemove(file) {
      const filename = file.response?.filename;
      if (filename) {
        axios.post('/temp-remove/' + filename).catch(() => {});
      }
    },
  };

  const openEvidenceModal = (activity: SkActivity) => {
    setSelectedActivity(activity);
    setErrors({});
    form.resetFields();
  };

  const handleUploadSubmit = async (values: { description: string; photos: UploadFile[] }) => {
    if (!activeActivity) return;
    setSubmitting(true);
    setErrors({});

    try {
      const res = await axios.post(`/sk/events-activities/${activeActivity.id}/evidence`, values);
      if (res.data?.success) {
        notification.success({
          message: 'Event Evidence Uploaded',
          description:
            res.data.message ||
            'Your event pictures and description have been saved and shared with MYDO Staff.',
          placement: 'topRight',
        });
        form.resetFields();
        router.reload({ only: ['activities'] });
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        notification.error({
          message: 'Please check your submission',
          description: error.response.data.message || 'Make sure you uploaded valid event pictures and a description.',
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: 'Upload failed',
          description: 'Could not save event evidence. Please try again.',
          placement: 'topRight',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    if (!activeActivity) return;
    setDeletingId(evidenceId);
    try {
      const res = await axios.delete(`/sk/events-activities/${activeActivity.id}/evidence/${evidenceId}`);
      if (res.data?.success) {
        notification.success({
          message: 'Evidence Removed',
          description: 'Your uploaded event evidence was removed.',
          placement: 'topRight',
        });
        router.reload({ only: ['activities'] });
      }
    } catch {
      notification.error({
        message: 'Could not remove evidence',
        placement: 'topRight',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Head title="SK Events & Evidence Upload" />

      <div className="mx-auto max-w-7xl space-y-8 text-slate-800">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-6">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-indigo-700 uppercase">
              <Compass size={16} /> SANGGUNIANG KABATAAN MONITORING
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Events & Activity Evidence Upload
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse municipal and barangay youth events below. Click <strong>Upload Event Evidence</strong> on any
              activity to upload event pictures and add a description for MYDO Staff monitoring.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search aria-hidden="true" size={17} className="absolute top-3.5 left-3.5 text-slate-400" />
            <input
              type="search"
              aria-label="Search activities"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event title or venue..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>
        </header>

        {/* Categories filter */}
        <div className="flex flex-wrap gap-2" aria-label="Activity categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                category === item
                  ? 'border-indigo-800 bg-indigo-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-600 hover:text-indigo-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((activity) => {
              const myUploadsCount = activity.my_evidences?.length ?? 0;

              return (
                <article
                  key={activity.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <Artwork activity={activity} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase">
                          {activity.category?.name}
                        </p>
                        <h3 className="mt-2 text-lg leading-6 font-bold text-slate-900">{activity.title}</h3>
                      </div>

                      <div className="min-w-14 rounded-lg bg-slate-50 px-2.5 py-1.5 text-center ring-1 ring-slate-200/70">
                        <p className="text-[10px] font-bold text-indigo-700 uppercase">
                          {dateLabel(activity.starts_at, { month: 'short' })}
                        </p>
                        <p className="text-xl leading-tight font-bold text-slate-900">
                          {dateLabel(activity.starts_at, { day: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500">
                          {dateLabel(activity.starts_at, { year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {activity.summary ?? activity.description}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={14} className="shrink-0 text-indigo-700" />
                        {dateLabel(activity.starts_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 size={14} className="shrink-0" />
                        {activityTime(activity)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0" />
                        {activity.venue_name}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      {myUploadsCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <CheckCircle2 size={14} />
                          {myUploadsCount} Evidence {myUploadsCount === 1 ? 'Entry' : 'Entries'} Uploaded
                        </span>
                      ) : (
                        <span className="text-slate-500">No evidence uploaded yet</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEvidenceModal(activity)}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition ${
                        myUploadsCount > 0
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      <Camera size={16} />
                      <span>{myUploadsCount > 0 ? 'View / Upload More Evidence' : 'Upload Event Evidence'}</span>
                    </button>

                    <div className="mt-auto pt-4">
                      <button
                        type="button"
                        onClick={() => openEvidenceModal(activity)}
                        className="flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-800 hover:text-indigo-600"
                      >
                        View event details & uploaded pictures <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-sm text-slate-500">No matching events or activities found.</span>}
            />
          </div>
        )}
      </div>

      {/* UPLOAD & VIEW EVENT EVIDENCE MODAL */}
      <Modal
        centered
        open={activeActivity !== null}
        onCancel={() => setSelectedActivity(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Camera size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">SK Event Pictures & Evidence Upload</p>
              <p className="text-xs font-normal text-slate-500">
                Shared directly with MYDO Staff for barangay event monitoring
              </p>
            </div>
          </div>
        }
        width={700}
        destroyOnHidden
      >
        {activeActivity && (
          <div className="space-y-6 pt-3">
            {/* Activity Summary Banner */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Tag color="geekblue" className="m-0 text-xs font-semibold">
                  {activeActivity.category?.name}
                </Tag>
                <span className="text-xs font-medium text-indigo-900">
                  {dateLabel(activeActivity.starts_at, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {activeActivity.venue_name}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-900">{activeActivity.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{activeActivity.description}</p>
            </div>

            {/* Upload Form */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <UploadCloud size={17} className="text-indigo-700" />
                Upload New Event Pictures & Description
              </h3>

              <Form form={form} layout="vertical" onFinish={handleUploadSubmit}>
                <Form.Item
                  name="photos"
                  label={
                    <span className="text-xs font-semibold text-slate-700">
                      Event Pictures (Strictly PNG, JPG, or JPEG — up to 10 photos)
                    </span>
                  }
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                  validateStatus={errors.photos ? 'error' : undefined}
                  help={errors.photos ? errors.photos[0] : undefined}
                  rules={[
                    {
                      required: true,
                      validator: async (_, fileList: UploadFile[] | undefined) => {
                        if (!fileList || fileList.length === 0) {
                          return Promise.reject(new Error('Please upload at least one picture of the event.'));
                        }
                        const uploading = fileList.some((f) => f.status === 'uploading');
                        if (uploading) {
                          return Promise.reject(new Error('Please wait for all pictures to finish uploading.'));
                        }
                        const invalid = fileList.some((f) => f.status === 'error' || !f.response?.filename);
                        if (invalid) {
                          return Promise.reject(new Error('One or more pictures failed to upload. Please remove and re-upload.'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Upload.Dragger {...uploadProps}>
                    <div className="flex flex-col items-center py-3 text-center">
                      <UploadCloud className="mb-2 h-7 w-7 text-indigo-700" />
                      <p className="text-xs font-semibold text-slate-800">
                        Click or drag event pictures here to upload
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Strictly PNG, JPG, or JPEG images only (max 5MB per photo)
                      </p>
                    </div>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-xs font-semibold text-slate-700">Event Description / Remarks</span>}
                  validateStatus={errors.description ? 'error' : undefined}
                  help={errors.description ? errors.description[0] : undefined}
                  rules={[
                    {
                      required: true,
                      message: 'Please write a short description about the event and your barangay participation.',
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Describe the event highlights, youth participation from your barangay, or accomplishment notes..."
                  />
                </Form.Item>

                <div className="flex justify-end gap-2">
                  <Button onClick={() => setSelectedActivity(null)}>Close</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<Camera size={15} />}
                    className="!bg-indigo-700 hover:!bg-indigo-800 font-semibold"
                  >
                    Submit Event Evidence
                  </Button>
                </div>
              </Form>
            </div>

            {/* Existing Uploaded Evidences by this SK Official */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileImage size={17} className="text-emerald-700" />
                My Uploaded Evidence for this Event ({activeActivity.my_evidences?.length ?? 0})
              </h3>

              {activeActivity.my_evidences && activeActivity.my_evidences.length > 0 ? (
                <div className="space-y-3">
                  {activeActivity.my_evidences.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700">{ev.description}</p>
                        <Popconfirm
                          title="Delete this evidence submission?"
                          onConfirm={() => handleDeleteEvidence(ev.id)}
                          okText="Delete"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            danger
                            type="text"
                            size="small"
                            loading={deletingId === ev.id}
                            icon={<Trash2 size={14} />}
                          />
                        </Popconfirm>
                      </div>

                      {ev.photos.length > 0 && (
                        <Image.PreviewGroup>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ev.photos.map((url, idx) => (
                              <Image
                                key={idx}
                                src={url}
                                alt={`Evidence photo ${idx + 1}`}
                                width={88}
                                height={88}
                                className="rounded-lg border border-slate-200 object-cover"
                              />
                            ))}
                          </div>
                        </Image.PreviewGroup>
                      )}

                      {ev.created_at && (
                        <p className="mt-2 text-[11px] text-slate-400">
                          Uploaded on{' '}
                          {dateLabel(ev.created_at, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  You have not uploaded any pictures or evidence for this event yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

SkEventsActivitiesPage.layout = (page: ReactNode) => (
  <SkAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user as SkUser}
    header="Events & Evidence Upload"
  >
    {page}
  </SkAuthLayout>
);

export default SkEventsActivitiesPage;
