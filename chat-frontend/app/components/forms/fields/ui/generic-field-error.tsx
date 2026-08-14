export function GenericFieldError({
  fieldError,
}: {
  fieldError: any | undefined;
}) {
  return (
    <>
      {fieldError && (
        <p className="text-destructive mt-1 text-xs">{fieldError.message}</p>
      )}
    </>
  );
}
