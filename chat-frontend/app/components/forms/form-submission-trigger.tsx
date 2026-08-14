import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { FieldConfig } from '~/lib/various/form-retrieving/types';
import { FormField } from './fields/form-field';

interface FormProps {
  fieldArray: FieldConfig[];
  formId?: string;
  submitLabel?: string;
  className?: string;
  containerClassName?: string;
  showSubmitButton?: boolean;
  children?: React.ReactNode;
  onSubmit: (data: any) => void;
  disabled: boolean;
}

export function FormTrigger({
  fieldArray,
  formId = 'generic-form',
  submitLabel = 'Submit',
  className,
  containerClassName,
  showSubmitButton = true,
  children,
  onSubmit,
  disabled,
}: FormProps) {
  return (
    <div className={cn('w-full', containerClassName)}>
      <form onSubmit={onSubmit} id={formId} className={className}>
        <div className="grid gap-4">
          <fieldset className="grid gap-4" disabled={disabled}>
            {children}
            {fieldArray
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((field, idx) => (
                <div key={field.name || idx}>
                  <FormField fieldConfig={field} />
                </div>
              ))}
          </fieldset>

          {showSubmitButton && (
            <Button type="submit" disabled={disabled} form={formId}>
              {disabled ? 'Submitting...' : submitLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
