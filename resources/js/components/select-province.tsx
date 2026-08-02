import { Select } from 'antd';
import { useEffect, useState } from 'react';

type Province = {
  provCode: string;
  provDesc: string;
};

type ProvinceOption = {
  value: string;
  label: string;
};

export default function SelectProvince({
  onChange,
  value,
}: {
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [options, setOptions] = useState<ProvinceOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);

      try {
        const response = await fetch('/load-provinces', {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load provinces.');
        }

        const provinces = (await response.json()) as Province[];

        setOptions(
          provinces.map((province) => ({
            value: province.provCode,
            label: province.provDesc,
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  return (
    <Select
      allowClear
      showSearch
      loading={loading}
      optionFilterProp="label"
      options={options}
      placeholder="Choose province"
      value={value || undefined}
      onChange={(selectedValue) => onChange?.(selectedValue ?? '')}
    />
  );
}
