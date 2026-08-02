import { useEffect, useState } from 'react';

import SelectField from './select-field';

type City = {
  citymunCode: string;
  citymunDesc: string;
};

type CityOption = {
  value: string;
  label: string;
};

export default function SelectCity({
  error,
  onChange,
  provinceCode,
  value,
}: {
  error?: string;
  onChange?: (value: string) => void;
  provinceCode: string;
  value?: string;
}) {
  const [options, setOptions] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!provinceCode) {
      setOptions([]);
      setErrorMessage('');
      return;
    }

    const loadCities = async () => {
      setLoading(true);
      setErrorMessage('');

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
        setErrorMessage('City / municipality list is unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [provinceCode]);

  return (
    <SelectField
      id="citymunCode"
      label="City / Municipality"
      disabled={!provinceCode}
      loading={loading}
      options={options}
      placeholder={provinceCode ? 'Choose your city or municipality' : 'Select a province first'}
      value={value}
      onChange={onChange}
      error={error}
      helperText={errorMessage || 'Select your city or municipality after choosing a province.'}
    />
  );
}
