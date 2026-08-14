import { Info } from 'lucide-react';
import { Link } from 'react-router';

export default function AccesoDenegado() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Info className="text-muted-foreground h-12 w-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-foreground text-2xl font-light">
            Acceso Restringido
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No tienes los permisos necesarios para acceder a esta página
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            to="/"
            className="text-primary-foreground inline-flex w-full items-center justify-center bg-orange-400 px-6 py-3 text-sm font-medium">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
