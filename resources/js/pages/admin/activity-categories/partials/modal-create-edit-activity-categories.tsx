import { ActivityCategory, ActivityCategoryPayload } from '@/types/activity-category';
import { App, Form, Input, Modal, Switch } from 'antd';
import axios from 'axios';
import { Info, Link2, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  data?: ActivityCategory;
  modalOpen: boolean;
  onClose: () => void;
  refetch: () => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ModalCreateEditActivityCategories = ({ data, modalOpen, onClose, refetch }: Props) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<ActivityCategoryPayload>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  const isEditing = (data?.id ?? 0) > 0;
  const nameValue = Form.useWatch('name', form);
  const isActiveValue = Form.useWatch('is_active', form);

  useEffect(() => {
    if (!modalOpen) return;

    setErrors({});
    setSlugTouched(false);

    if (isEditing) {
      form.setFieldsValue({
        name: data?.name ?? '',
        slug: data?.slug ?? '',
        description: data?.description ?? '',
        is_active: !!data?.is_active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ name: '', slug: '', description: '', is_active: true });
    }
  }, [modalOpen, isEditing, data, form]);

  // Keep the slug in sync with the name until the admin edits the slug by hand.
  useEffect(() => {
    if (!modalOpen || isEditing || slugTouched) return;

    form.setFieldValue('slug', slugify(nameValue ?? ''));
  }, [nameValue, modalOpen, isEditing, slugTouched, form]);

  const onFinish = async (values: ActivityCategoryPayload) => {
    setLoading(true);

    try {
      const payload = {
        ...values,
        name: values.name.trim(),
        slug: slugify(values.slug || values.name),
        description: values.description?.trim() ? values.description.trim() : null,
      };

      if (isEditing) {
        await axios.put(`/admin/activity-categories/${data?.id}`, payload);
        notification.success({
          message: 'Category updated',
          description: `“${payload.name}” was saved successfully.`,
          placement: 'topRight',
        });
      } else {
        await axios.post('/admin/activity-categories', payload);
        notification.success({
          message: 'Category created',
          description: `“${payload.name}” was added successfully.`,
          placement: 'topRight',
        });
      }

      onClose();
      refetch();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
        notification.error({
          message: 'Please check the form',
          description: 'Some fields need attention before this category can be saved.',
          placement: 'topRight',
        });
      } else {
        const description =
          axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Something went wrong. Please try again.';

        notification.error({
          message: isEditing ? 'Could not update category' : 'Could not create category',
          description,
          placement: 'topRight',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      forceRender
      open={modalOpen}
      width={640}
      centered
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            {isEditing ? <Pencil size={17} /> : <Plus size={17} />}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-stone-900">{isEditing ? 'Edit category' : 'New activity category'}</span>
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              {isEditing ? 'Update the details below and save your changes.' : 'Categories group activities in listings and filters.'}
            </span>
          </span>
        </div>
      }
      okText={isEditing ? 'Save changes' : 'Create category'}
      cancelText="Cancel"
      onCancel={() => {
        if (!loading) onClose();
      }}
      okButtonProps={{ htmlType: 'submit', loading }}
      cancelButtonProps={{ disabled: loading }}
      maskClosable={!loading}
      closable={!loading}
      destroyOnHidden
      modalRender={(dom) => (
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
          requiredMark
          initialValues={{ name: '', slug: '', description: '', is_active: true }}
        >
          {dom}
        </Form>
      )}
    >
      <div className="flex flex-col gap-1 pt-2">
        <Form.Item
          name="name"
          label="Category name"
          className="mb-4"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.[0]}
          rules={[{ required: true, message: 'Enter a category name.' }]}
        >
          <Input tabIndex={1} placeholder="e.g. Leadership" maxLength={100} showCount disabled={loading} />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          tooltip="Used in URLs. Leave as is to generate it from the category name."
          className="mb-4"
          validateStatus={errors.slug ? 'error' : ''}
          help={errors.slug?.[0] ?? 'Lowercase letters, numbers, and hyphens only.'}
          rules={[{ required: true, message: 'Enter a slug.' }]}
        >
          <Input
            tabIndex={2}
            prefix={<Link2 size={15} className="text-stone-400" />}
            placeholder="e.g. leadership"
            disabled={loading}
            onChange={() => setSlugTouched(true)}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          className="mb-4"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.[0]}
        >
          <Input.TextArea tabIndex={3} rows={4} placeholder="Short summary shown to youth when browsing activities." disabled={loading} />
        </Form.Item>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
          <Form.Item
            name="is_active"
            valuePropName="checked"
            className="mb-0"
            validateStatus={errors.is_active ? 'error' : ''}
            help={errors.is_active?.[0]}
          >
            <Switch tabIndex={4} checkedChildren="Active" unCheckedChildren="Inactive" disabled={loading} />
          </Form.Item>
          <div className="mt-3 flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-xs leading-5 text-stone-500">
              {isActiveValue === false
                ? 'This category is hidden from listings. You can switch it back at any time.'
                : 'This category is visible to youth and can be used when publishing activities.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateEditActivityCategories;
