import { forwardRef, useEffect, useState } from 'react';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { cn } from '~/lib/utils';

const countryOptions = [
  {
    code: 'MX',
    label: 'México',
    dialCode: '+52',
    flag: '🇲🇽',
    pattern: '(\\d{3})(\\d{3})(\\d{4})',
    maxLength: 10,
  },
  {
    code: 'US',
    label: 'Estados Unidos',
    dialCode: '+1',
    flag: '🇺🇸',
    pattern: '(\\d{3})(\\d{3})(\\d{4})',
    maxLength: 10,
  },
];

// Helper function to escape special characters in a string for RegExp
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> & {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: (typeof countryOptions)[0]) => void;
  defaultCountry?: 'MX' | 'US';
  name?: string;
  onValidationChange?: (isValid: boolean) => void;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      onChange,
      value = '',
      defaultCountry = 'MX',
      onCountryChange,
      onValidationChange,
      ...props
    },
    ref
  ) => {
    const [country, setCountry] = useState(
      countryOptions.find((c) => c.code === defaultCountry) || countryOptions[0]
    );

    // Extract national number from the value (without country code)
    const extractNationalNumber = (fullNumber: string, dialCode: string) => {
      if (!fullNumber) return '';
      const escapedDialCode = escapeRegExp(dialCode);
      return fullNumber
        .replace(new RegExp(`^${escapedDialCode}`), '')
        .replace(/\D/g, '');
    };

    // Validate the phone number has exactly 10 digits
    const validatePhoneNumber = (nationalNumber: string) => {
      // We only care about the digits (not dashes or other formatting)
      const digitsOnly = nationalNumber.replace(/\D/g, '');
      const isValid = digitsOnly.length === country.maxLength;
      return isValid;
    };

    // Validate current number whenever it changes
    useEffect(() => {
      const nationalNumber = extractNationalNumber(value, country.dialCode);
      const isValid = validatePhoneNumber(nationalNumber);

      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }, [value, country, onValidationChange]);

    const handleCountryChange = (code: string) => {
      const newCountry =
        countryOptions.find((c) => c.code === code) || countryOptions[0];

      // Get the current national number without country code
      const nationalNumber = extractNationalNumber(value, country.dialCode);

      // Create new value with new country code + existing number
      const newValue = `${newCountry.dialCode}${nationalNumber}`;

      // Update country state
      setCountry(newCountry);

      // Notify parent of country change
      if (onCountryChange) {
        onCountryChange(newCountry);
      }

      // Update the full value with the new country code
      if (onChange && nationalNumber) {
        onChange(newValue);
      }
    };

    const formatPhoneNumber = (input: string) => {
      // Remove non-digits
      const digitsOnly = input.replace(/\D/g, '');

      // Limit to max length
      const limitedDigits = digitsOnly.substring(0, country.maxLength);

      // Apply automatic formatting based on input length
      if (limitedDigits.length <= 3) {
        return limitedDigits;
      } else if (limitedDigits.length <= 6) {
        return `${limitedDigits.substring(0, 3)}-${limitedDigits.substring(3)}`;
      } else {
        return `${limitedDigits.substring(0, 3)}-${limitedDigits.substring(3, 6)}-${limitedDigits.substring(6)}`;
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Get raw digits (remove all non-digits)
      const rawValue = e.target.value.replace(/\D/g, '');

      // Store the raw digits with the country code (no dashes)
      const fullNumber = `${country.dialCode}${rawValue}`;

      if (onChange) {
        onChange(fullNumber);
      }
    };

    // Extract just the national number without country code for display
    const nationalNumber = extractNationalNumber(value, country.dialCode);
    const displayValue = formatPhoneNumber(nationalNumber);
    const isValidPhone = validatePhoneNumber(nationalNumber);

    // Detect if the country code in the value doesn't match the selected country
    useEffect(() => {
      if (value && country) {
        // Check if the value starts with the current country's dial code
        if (!value.startsWith(country.dialCode)) {
          // Try to find a matching country based on the value's prefix
          const matchingCountry = countryOptions.find((c) =>
            value.startsWith(c.dialCode)
          );

          if (matchingCountry && matchingCountry.code !== country.code) {
            setCountry(matchingCountry);
          }
        }
      }
    }, [value, country]);

    return (
      <div className={cn('flex', className)}>
        <Select value={country.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="flex w-20 gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10">
            <SelectValue>
              <span className="mr-1">{country.flag}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                <span className="mr-2">{option.flag}</span>
                {option.label} ({option.dialCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          ref={ref}
          className={cn(
            'rounded-s-none rounded-e-lg',
            isValidPhone && nationalNumber.length > 0 ? 'border-green-500' : ''
          )}
          placeholder={country.code === 'MX' ? '555-123-4567' : '555-123-4567'}
          value={displayValue}
          onChange={handleInputChange}
          type="tel"
          inputMode="numeric"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
