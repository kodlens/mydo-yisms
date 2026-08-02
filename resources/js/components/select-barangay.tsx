import { Select } from 'antd';
import { useEffect, useState } from 'react';

type Barangay = {
  brgyCode: string;
  brgyDesc: string;
};

type BarangayOption = {
  value: string;
  label: string;
};

export default function SelectBarangay({
  cityCode,
  onChange,
  provinceCode,
  value,
}: {
  cityCode: string;
  onChange?: (value: string) => void;
  provinceCode: string;
  value?: string;
}) {
  const [options, setOptions] = useState<BarangayOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceCode || !cityCode) {
      setOptions([]);
      return;
    }

    const loadBarangays = async () => {
      setLoading(true);

      try {
        const searchParams = new URLSearchParams({
          cityCode,
          provCode: provinceCode,
        });

        const response = await fetch(`/load-barangays?${searchParams.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load barangays.');
        }

        const barangays = (await response.json()) as Barangay[];

        setOptions(
          barangays.map((barangay) => ({
            value: barangay.brgyCode,
            label: barangay.brgyDesc,
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadBarangays();
  }, [cityCode, provinceCode]);

  return (
    <Select
      allowClear
      showSearch
      disabled={!provinceCode || !cityCode}
      loading={loading}
      optionFilterProp="label"
      options={options}
      placeholder={cityCode ? 'Choose barangay' : 'Select city / municipality first'}
      value={value || undefined}
      onChange={(selectedValue) => onChange?.(selectedValue ?? '')}
    />
  );
}
