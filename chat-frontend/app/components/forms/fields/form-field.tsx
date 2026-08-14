import {
  Controller,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form';
import z from 'zod';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { getHtmlFieldType } from '~/lib/various/form-retrieving/utils';
import { GenericFieldError } from './ui/generic-field-error';
import { GenericLabel } from './ui/generic-label';
import type { FieldConfig } from '~/lib/various/form-retrieving/types';

function generateZodSchema() {
  return z.string().min(2);
}

export const FormField = ({ fieldConfig }: { fieldConfig: FieldConfig }) => {
  const { name: fieldName, label: fieldLabel, type: fieldType } = fieldConfig;

  const fieldSchema = generateZodSchema();
  const rules = {
    required: 'Campo vacío',
    validate: (value) => {
      const result = fieldSchema.safeParse(value);
      return result.success ? true : result.error?.errors[0]?.message;
    },
  } as RegisterOptions<any, FieldPath<any>>;

  return (
    <>
      <GenericLabel label={fieldLabel} htmlFor={fieldName} />
      <Controller
        name={fieldName}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <Input
              {...field}
              type={getHtmlFieldType(fieldType)}
              onChange={field.onChange}
              className={cn(
                'bg-background',
                fieldState.error ? 'ring-destructive ring-1' : ''
              )}
            />
            <GenericFieldError fieldError={fieldState.error} />
          </>
        )}
      />
    </>
  );
};
