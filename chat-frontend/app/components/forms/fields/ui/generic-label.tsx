import { Label } from '~/components/ui/label';

export const GenericLabel = ({
  htmlFor,
  label,
  isRequired = false,
  className,
}: {
  htmlFor: string;
  label: string;
  isRequired?: boolean;
  className?: string;
}) => {
  return (
    <Label htmlFor={htmlFor} className={className}>
      <span className="leading-relaxed">
        {label}
        {isRequired && <span className="text-xs text-red-500"> *</span>}
      </span>
    </Label>
  );
};
