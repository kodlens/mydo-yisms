import { useEffect, useState } from 'react';

import SelectField from './select-field';

type Province = {
  provCode: string;
  provDesc: string;
};

type ProvinceOption = {
  value: string;
  label: string;
};

export default function SelectProvince({
  error,
  onChange,
  value,
}: {
  error?: string;
  onChange?: (value: string) => void;
  value?: string;
}) {
  const [options, setOptions] = useState<ProvinceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      setErrorMessage('');

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
        setErrorMessage('Province list is unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  return (
    <SelectField
      id="provCode"
      label="Province"
      loading={loading}
      options={options}
      placeholder="Choose your province"
      value={value}
      onChange={onChange}
      error={error}
      helperText={errorMessage || 'Select the province where you currently reside.'}
    />
  );
}
