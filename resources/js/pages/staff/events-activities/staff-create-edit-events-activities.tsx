import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { Activity, ActivityPayload, ActivityStatus } from '@/types/activity';
import { ActivityCategory } from '@/types/activity-category';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Head, Link, router } from '@inertiajs/react';
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Switch, Tag } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { ReactElement, ReactNode, useMemo, useState } from 'react';

/**
 * Props come from the controller as Inertia props, so the form is already filled in
 * on first render. `activity` is null when creating, and set when editing.
 */
type Props = {
  activity: Activity | null;
  categories: ActivityCategory[];
};

/**
 * What the form holds. Same as the API payload except the dates, which DatePicker
 * gives us as dayjs objects instead of strings.
 */
type ActivityFormValues = Omit<
  ActivityPayload,
  | 'slug'
  | 'cover_image_path'
  | 'activity_category_id'
  | 'title'
  | 'summary'
  | 'description'
  | 'venue_name'
  | 'venue_address'
  | 'eligibility_notes'
  | 'requirements'
  | 'starts_at'
  | 'ends_at'
  | 'registration_opens_at'
  | 'registration_closes_at'
> & {
  // Text fields hold plain strings here; blankToNull() converts them on submit.
  activity_category_id?: number;
  title: string;
  summary: string;
  description: string;
  venue_name: string;
  venue_address: string;
  eligibility_notes: string;
  requirements: string;
  // DatePicker hands us dayjs objects; the API wants formatted strings.
  starts_at: Dayjs | null;
  ends_at: Dayjs | null;
  registration_opens_at: Dayjs | null;
  registration_closes_at: Dayjs | null;
};

const STATUS_OPTIONS: { label: string; value: ActivityStatus; hint: string }[] = [
  { label: 'Draft', value: 'draft', hint: 'Only staff can see this. Nothing is shown to youth yet.' },
  { label: 'Published', value: 'published', hint: 'Visible on the public site and open for registration.' },
  { label: 'Cancelled', value: 'cancelled', hint: 'Kept for reference, but youth cannot register.' },
  { label: 'Archived', value: 'archived', hint: 'Closed out and kept out of all listings.' },
];

const LIST_PATH = '/staff/events-activities';

/** Turn "2026-01-05T09:00" into "2026-01-05 09:00:00", which is what the API expects. */
const toApiDate = (value?: Dayjs | null) => (value ? value.format('YYYY-MM-DD HH:mm:ss') : null);

/** Turn an API date string into a dayjs object the DatePicker understands. */
const toDayjs = (value?: string | null) => (value ? dayjs(value) : null);

/** Empty strings mean "not provided", which the API stores as null. */
const blankToNull = (value?: string | null) => {
  const trimmed = (value ?? '').trim();

  return trimmed === '' ? null : trimmed;
};

const StaffCreateEditEventsActivitiesPage = ({ activity, categories }: Props) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<ActivityFormValues>();
  const [saving, setSaving] = useState(false);

  const isEditing = (activity?.id ?? 0) > 0;

  // Live values used by the hint text under each switch.
  const statusValue = Form.useWatch('status', form);
  const requiresRegistrationValue = Form.useWatch('requires_registration', form);
  const titleValue = Form.useWatch('title', form);

  const statusHint = useMemo(
    () => STATUS_OPTIONS.find((option) => option.value === statusValue)?.hint ?? 'Choose how this activity should appear.',
    [statusValue],
  );

  // Matches what Laravel's Str::slug() would produce, so the preview is honest.
  const slugPreview = useMemo(
    () =>
      (titleValue ?? '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-'),
    [titleValue],
  );

  /** Seed the form from the row we are editing, or from sensible defaults. */
  const initialValues: ActivityFormValues = isEditing
    ? {
      activity_category_id: activity?.activity_category_id,
      title: activity?.title ?? '',
      summary: activity?.summary ?? '',
      description: activity?.description ?? '',
      venue_name: activity?.venue_name ?? '',
      venue_address: activity?.venue_address ?? '',
      starts_at: toDayjs(activity?.starts_at),
      ends_at: toDayjs(activity?.ends_at),
      registration_opens_at: toDayjs(activity?.registration_opens_at),
      registration_closes_at: toDayjs(activity?.registration_closes_at),
      capacity: activity?.capacity ?? null,
      requires_registration: !!activity?.requires_registration,
      requires_approval: !!activity?.requires_approval,
      eligibility_notes: activity?.eligibility_notes ?? '',
      requirements: activity?.requirements ?? '',
      status: activity?.status ?? 'draft',
      is_featured: !!activity?.is_featured,
    }
    : {
      activity_category_id: undefined,
      title: '',
      summary: '',
      description: '',
      venue_name: '',
      venue_address: '',
      starts_at: null,
      ends_at: null,
      registration_opens_at: null,
      registration_closes_at: null,
      capacity: null,
      requires_registration: true,
      requires_approval: false,
      eligibility_notes: '',
      requirements: '',
      status: 'draft',
      is_featured: false,
    };

  const handleFinish = async (values: ActivityFormValues) => {
    setSaving(true);

    try {
      const payload: ActivityPayload = {
        // Spreading first, then overriding, keeps the fields the form does not own out.
        ...values,
        title: values.title.trim(),
        summary: blankToNull(values.summary),
        venue_address: blankToNull(values.venue_address),
        eligibility_notes: blankToNull(values.eligibility_notes),
        requirements: blankToNull(values.requirements),
        starts_at: toApiDate(values.starts_at) ?? '',
        ends_at: toApiDate(values.ends_at) ?? '',
        registration_opens_at: toApiDate(values.registration_opens_at),
        registration_closes_at: toApiDate(values.registration_closes_at),
        // The slug is generated on the server from the title, so it is not sent here.
        slug: '',
        // No upload field on this form, so keep whatever image the row already has.
        cover_image_path: activity?.cover_image_path ?? null,
        activity_category_id: values.activity_category_id as number,
      };

      const url = isEditing ? `/staff/events-activities/${activity?.id}` : '/staff/events-activities';

      const res = await axios.request({ url, method: isEditing ? 'PUT' : 'POST', data: payload });
      if (res.data.success) {
        notification.success({
          message: isEditing ? 'Event/activity updated' : 'Event/activity created',
          description: res.data?.message ?? `“${payload.title}” was saved successfully.`,
          placement: 'topRight',
        });
        router.visit(LIST_PATH);
      }
      // Back to the list. Use the index URL so the filters are not stuck in history.

    } catch (err) {
      // The server sends 422 with a per-field errors object; point each error at its field.
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const errors = (err.response.data?.errors ?? {}) as Record<string, string[]>;

        // Attach each server error to its matching field so antd shows it inline.
        Object.entries(errors).forEach(([field, messages]) => {
          form.setFields([{ name: field as keyof ActivityFormValues, errors: messages }]);
        });

        notification.error({
          message: 'Please check the form',
          description: err.response.data?.message ?? 'Some fields need attention before this activity can be saved.',
          placement: 'topRight',
        });
      } else {
        const description = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : 'Something went wrong. Please try again.';

        notification.error({
          message: isEditing ? 'Could not update activity' : 'Could not create activity',
          description,
          placement: 'topRight',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head title={isEditing ? `Edit ${activity?.title}` : 'New event/activity'} />

      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        {/* Back link, so the form is always one click from the list. */}
        <div>
          <Link href={LIST_PATH} className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950">
            <ArrowLeftOutlined />
            Back to events &amp; activities
          </Link>
        </div>

        <header>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Staff Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
            {isEditing ? 'Edit event/activity' : 'New event/activity'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
            {isEditing
              ? 'Update the details below and save your changes.'
              : 'Drafts stay hidden from the public site until you publish them.'}
          </p>
        </header>

        <Form<ActivityFormValues>
          form={form}
          layout="vertical"
          requiredMark
          autoComplete="off"
          initialValues={initialValues}
          onFinish={handleFinish}
          disabled={saving}
        >
          {/* Sticky footer so Save stays reachable on a long form. */}
          <Card
            className="rounded-2xl"
            title="Details"
            extra={
              <Space>
                <Button onClick={() => router.visit(LIST_PATH)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {isEditing ? 'Save changes' : 'Create'}
                </Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[
                    { required: true, message: 'Enter a title.' },
                    { max: 150, message: 'Keep the title under 150 characters.' },
                  ]}
                  extra="The page address is generated from this title."
                >
                  <Input placeholder="e.g. Barangay Youth Cleanup" showCount maxLength={150} />
                </Form.Item>
              </Col>

              <Col xs={24} lg={8}>
                {/* Read-only preview: the real slug is generated by Laravel on save. */}
                <Form.Item label="Page address (generated)">
                  <Input
                    value={slugPreview || '—'}
                    readOnly
                    placeholder="type a title first"
                    suffix={<Tag color="green">auto</Tag>}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="activity_category_id"
                  label="Category"
                  rules={[{ required: true, message: 'Choose a category.' }]}
                  extra={categories.length === 0 ? 'No active categories yet. Ask an admin to add one.' : undefined}
                >
                  <Select
                    placeholder="Choose a category"
                    showSearch
                    optionFilterProp="label"
                    loading={categories.length === 0}
                    options={categories.map((category) => ({ label: category.name, value: category.id }))}
                    notFoundContent="No active categories found."
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item name="venue_name" label="Venue" rules={[{ required: true, message: 'Enter a venue name.' }]}>
                  <Input placeholder="e.g. Barangay Hall" maxLength={150} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="venue_address" label="Venue address">
              <Input placeholder="e.g. Poblacion, Kidapawan" />
            </Form.Item>

            <Form.Item name="summary" label="Summary" rules={[{ max: 2000, message: 'Keep the summary under 2000 characters.' }]}>
              <Input.TextArea rows={2} placeholder="One or two lines shown in listings." />
            </Form.Item>

            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Enter a description.' }]}>
              <Input.TextArea rows={6} placeholder="Full details of what the activity is about." />
            </Form.Item>
          </Card>

          <Card className="mt-5 rounded-2xl" title="Schedule">
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Form.Item name="starts_at" label="Starts at" rules={[{ required: true, message: 'Choose a start date and time.' }]}>
                  <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item
                  name="ends_at"
                  label="Ends at"
                  dependencies={['starts_at']}
                  rules={[
                    { required: true, message: 'Choose an end date and time.' },
                    ({ getFieldValue }) => ({
                      validator: (_, value: Dayjs | null) => {
                        const startsAt = getFieldValue('starts_at') as Dayjs | undefined;

                        if (value && startsAt && value.isBefore(startsAt)) {
                          return Promise.reject(new Error('The end must come after the start.'));
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item
                  name="registration_opens_at"
                  label="Registration opens"
                  extra="Optional. Leave empty to open registration immediately."
                >
                  <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item
                  name="registration_closes_at"
                  label="Registration closes"
                  dependencies={['registration_opens_at']}
                  extra="Optional. Leave empty to keep registration open until it starts."
                  rules={[
                    ({ getFieldValue }) => ({
                      validator: (_, value: Dayjs | null) => {
                        const opensAt = getFieldValue('registration_opens_at') as Dayjs | undefined;

                        if (value && opensAt && value.isBefore(opensAt)) {
                          return Promise.reject(new Error('Registration must close on or after it opens.'));
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="mt-5 rounded-2xl" title="Participation">
            <Row gutter={16}>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="capacity"
                  label="Capacity"
                  extra="Leave empty for unlimited slots."
                  rules={[{ type: 'integer', min: 1, message: 'Capacity must be at least 1.' }]}
                >
                  <InputNumber min={1} className="w-full" placeholder="Unlimited" />
                </Form.Item>
              </Col>

              <Col xs={24} lg={8}>
                <Form.Item name="requires_registration" label="Registration" valuePropName="checked">
                  <Switch checkedChildren="Required" unCheckedChildren="Open" />
                </Form.Item>
                {requiresRegistrationValue === false && (
                  <p className="-mt-3 text-xs leading-5 text-stone-500">
                    <Tag>Open attendance</Tag> Youth can simply show up, no sign-up needed.
                  </p>
                )}
              </Col>

              <Col xs={24} lg={8}>
                <Form.Item name="requires_approval" label="Approval" valuePropName="checked">
                  <Switch checkedChildren="Needs approval" unCheckedChildren="Auto-approve" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Form.Item name="eligibility_notes" label="Eligibility notes">
                  <Input.TextArea rows={3} placeholder="Who may join, e.g. ages 15–30 only." />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item name="requirements" label="Requirements">
                  <Input.TextArea rows={3} placeholder="What to bring, e.g. ID and worn shoes." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="mt-5 rounded-2xl" title="Visibility">
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Choose a status.' }]}>
                  <Select options={STATUS_OPTIONS.map(({ label, value }) => ({ label, value }))} />
                </Form.Item>

                <div className="-mt-2 flex items-start gap-2">
                  <InfoCircleOutlined className="mt-0.5 shrink-0 text-stone-400" />
                  <p className="text-xs leading-5 text-stone-500">{statusHint}</p>
                </div>
              </Col>

              <Col xs={24} lg={12}>
                <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                  <Switch checkedChildren="Featured" unCheckedChildren="Normal" />
                </Form.Item>
                <p className="-mt-3 text-xs leading-5 text-stone-500">Featured activities are highlighted on the home page.</p>
              </Col>
            </Row>
          </Card>

          {/* Save bar at the bottom too, for when the user scrolls to the end of the form. */}
          <div className="sticky bottom-0 mt-5 flex justify-end gap-3 rounded-2xl border border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <Button onClick={() => router.visit(LIST_PATH)} disabled={saving}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEditing ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

StaffCreateEditEventsActivitiesPage.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffCreateEditEventsActivitiesPage;
