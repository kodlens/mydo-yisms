import { useEffect, useState } from 'react';

import SelectField from './select-field';

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
  error,
  onChange,
  provinceCode,
  value,
}: {
  cityCode: string;
  error?: string;
  onChange?: (value: string) => void;
  provinceCode: string;
  value?: string;
}) {
  const [options, setOptions] = useState<BarangayOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!provinceCode || !cityCode) {
      setOptions([]);
      setErrorMessage('');
      return;
    }

    const loadBarangays = async () => {
      setLoading(true);
      setErrorMessage('');

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
        setErrorMessage('Barangay list is unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBarangays();
  }, [cityCode, provinceCode]);

  return (
    <SelectField
      id="brgyCode"
      label="Barangay"
      disabled={!provinceCode || !cityCode}
      loading={loading}
      options={options}
      placeholder={cityCode ? 'Choose your barangay' : 'Select a city or municipality first'}
      value={value}
      onChange={onChange}
      error={error}
      helperText={errorMessage || 'Select your barangay after choosing a city or municipality.'}
    />
  );
}
