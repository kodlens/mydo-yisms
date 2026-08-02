import { Select } from 'antd';
import { useEffect, useState } from 'react';

type City = {
  citymunCode: string;
  citymunDesc: string;
};

type CityOption = {
  value: string;
  label: string;
};

export default function SelectCity({
  onChange,
  provinceCode,
  value,
}: {
  onChange?: (value: string) => void;
  provinceCode: string;
  value?: string;
}) {
  const [options, setOptions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceCode) {
      setOptions([]);
      return;
    }

    const loadCities = async () => {
      setLoading(true);

      try {
        const searchParams = new URLSearchParams({
          provCode: provinceCode,
        });

        const response = await fetch(`/load-cities?${searchParams.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load cities.');
        }

        const cities = (await response.json()) as City[];

        setOptions(
          cities.map((city) => ({
            value: city.citymunCode,
            label: city.citymunDesc,
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [provinceCode]);

  return (
    <Select
      allowClear
      showSearch
      disabled={!provinceCode}
      loading={loading}
      optionFilterProp="label"
      options={options}
      placeholder={provinceCode ? 'Choose city / municipality' : 'Select province first'}
      value={value || undefined}
      onChange={(selectedValue) => onChange?.(selectedValue ?? '')}
    />
  );
}
