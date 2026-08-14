import { isRouteErrorResponse } from 'react-router';

export function RouteErrorBoundary({ error }: { error: unknown }) {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{error.status}</h1>
          <p className="text-muted-foreground">
            {error.data?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Ha ocurrido un error</h1>
        <p className="text-muted-foreground">Un error no manejado ha surgido</p>
      </div>
    </div>
  );
}
