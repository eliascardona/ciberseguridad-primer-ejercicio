# Ejecución del proyecto

## Con Docker instalado en tu equipo de cómputo

```
git clone https://github.com/eliascardona/ciberseguridad-primer-ejercicio.git
```

luego

```
cd \ubicacion-donde-ejecutaste-git-clone\ciberseguridad-primer-ejercicio
```

o el sig. comando para mac

```
cd /ubicacion-donde-ejecutaste-git-clone/ciberseguridad-primer-ejercicio
```

Si por defecto no está inicializado Docker, abre Docker Desktop y luego vuelve a la terminal que tenías abierta para ejecutar:

```
docker compose up
```

Si aplicas cambios al proyecto, deberás reiniciar tus contenedores. Una forma de hacerlo es con:

```
docker compose down
```

y luego

```
docker compose up --build
```

## Sin Docker instalado

Busca en Google como descargar Postgres. La versión 17 o 17.5

Descarga el instalable de Postgres y ejecutalo.

Una vez instalado postgres se te pedirá configurar la constraseña del administrador de la base de datos.

Ingresa cualquier contraseña.

También se te perdirá configurar el puerto de la base de datos. Deja el puerto por defecto (puede ser 3432 o 5433)

Una vez instalado y configurado, accede a tu base de datos usando el siguiente comando:

```
psql -U postgres -p <PUERTO_CONFIGURADO>
```

Te solicitará la contraseña.

Una vez dentro de la BD ejecuta los siguientes tres siguiente comando

```
CREATE ROLE nombre_de_usuario WITH LOGIN SUPERUSER PASSWORD 'password';
```

```
CREATE DATABASE nombre_de_bd OWNER nombre_de_usuario;
```

```
GRANT CONNECT ON DATABASE nombre_de_bd TO nombre_de_usuario;
```
