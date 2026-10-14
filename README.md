# Guía breve de instalación y uso

## Explicación del ejemplo

Consta de un ejemplo muy sencillo elaborado con Spring Boot como backend y con React Router como frontend.

En el backend deberás crear un archivo `.env` con valores como los siguientes
```
PORT=8082

# Required
DATASOURCE_URL=jdbc:postgresql://localhost:5432/escuela
DATASOURCE_USERNAME=pg_username
DATASOURCE_PASSWORD=pg_pass
DATASOURCE_SCHEMA=public

# Optional (with defaults)
DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
HIBERNATE_DDL_AUTO=update
```

El `DATASOURCE_URL` se compone de la siguiente forma:
```
<PROTOCOLO_CONEXION>://<HOST>:<PUERTO>/<NOMBRE_DE_BD>
```

En nuestro caso, se deja con jdbc y postgresql como Protocolo de conexión, localhost, puerto 5432 o el configurado en la instalación de Postgresql y el nombre de la B.D. en el ejemplo es `escuela`, pero esa B.D. se debe crear previamente. Por eso la variable **DATASOURCE_URL** tiene el siguiente valor:

```
jdbc:postgresql://localhost:5435/escuela
```
### Cómo crear la BD

Abre una terminal PowerShell, CMD o la que tenga tu sistema operativo, luego ejecuta:

```
psql -U postgres
```
Debería solicitar una contraseña. Debes ingresar la contraseña que le asignaste al super usuario al momento de INSTALAR POSTGRES.

Dentro de `psql` que es una línea de comandos de Postgres que establece una conexión con la BD, debes crear un ROL alternativo para ingresar a la BD.
Para fines prácticos, le daremos privilegios de SUPER USUARIO. Es una mala práctica que aplicaciones web se conecten a una Base de Datos con este nivel de privilegio, pero para el ejemplo es lo que haremos.

```
CREATE ROLE nombre_de_usuario WITH LOGIN SUPERUSER PASSWORD 'password';
```

Crea la base de datos con el nombre que quieras

```
CREATE DATABASE nombre_de_bd OWNER nombre_de_usuario;
```

Dale el privilegio de conexión al usuario que creaste

```
GRANT CONNECT ON DATABASE nombre_de_bd TO nombre_de_usuario;
```


### Cómo cargar las variables de entorno

Dentro del backend (en la raíz de la carpeta) se encuentra un script de python: `load_env.py`. Si se ejecuta en PowerShell exportará las variables de entorno a la sesión de terminal actual.

```powershell
python .\load_env.py | Invoke-Expression
```

- **Recuerda que debes estar dentro de la carpeta del backend**



# Preparación del entorno de desarrollo en Windows

## Objetivo

Preparar un equipo Windows para desarrollar y ejecutar aplicaciones web utilizando **Spring Boot con Amazon Corretto JDK 17** en el backend y **React con Vite** en el frontend.

Para ello, se utilizarán scripts de PowerShell que automatizan la instalación y desinstalación de las herramientas necesarias, incluyendo Maven, Scoop y NVM for Windows. NVM permitirá administrar la versión de Node.js utilizada por los proyectos de frontend.

## 1. Clonar el repositorio

Primero, clona el siguiente repositorio en tu equipo:

```powershell
git clone https://github.com/eliascardona/ciberseguridad-primer-ejercicio.git
```

Accede al directorio del proyecto:

```powershell
cd ciberseguridad-primer-ejercicio
```

Los scripts de preparación del entorno se encuentran en el repositorio. Ejecútalos desde PowerShell siguiendo el orden indicado en este documento.

## 2. Scripts disponibles

Los scripts automatizan la configuración del entorno de desarrollo y permiten revertir las instalaciones cuando sea necesario.

> **Nota:** los nombres de archivo siguientes son nombres descriptivos de referencia. Si los archivos del repositorio tienen nombres diferentes, utiliza los nombres reales al ejecutar los comandos.

### `install-scoop.ps1`

Instala Scoop, un gestor de paquetes para Windows que facilita la instalación y actualización de herramientas de desarrollo.

Este script instala exclusivamente Scoop; no instala Java, Maven ni Node.js.

Ejecución:

```powershell
.\install-scoop.ps1
```

### `install-java-maven.ps1`

Instala las herramientas necesarias para desarrollar y ejecutar aplicaciones Java con Spring Boot:

- Amazon Corretto JDK 17.
- Apache Maven 3.

Scoop se utiliza como gestor de paquetes para facilitar la instalación y administración de estas herramientas.

Ejecución:

```powershell
.\install-java-maven.ps1
```

### `uninstall-java-maven.ps1`

Desinstala las herramientas Java y Maven instaladas por el script correspondiente, además de limpiar los recursos de Scoop asociados a esa instalación, según las operaciones definidas en el script.

Ejecución:

```powershell
.\uninstall-java-maven.ps1
```

### `install-nvm-node24.ps1`

Instala NVM for Windows mediante Scoop y lo utiliza para instalar y activar Node.js 24.

También verifica la disponibilidad de Node.js y npm e instala globalmente `create-vite`, el generador de proyectos de Vite.

**Requisito:** Scoop debe estar instalado previamente. Si no está disponible, el script debe detenerse.

Ejecución:

```powershell
.\install-nvm-node24.ps1
```

## NOTA: Tras realizar pruebas, el script anterior no funciona por completo

Se ejecutó el script en más de una ocasión. Se instala `nvm` (Node Version Manager), pero no `Node.js`

- Para instalar `Node.js 24` ejecuta los siguientes comandos:

```powershell
nvm version
```

Para verificar que se instaló `nvm` correctamente.

```powershell
nvm install 24
```

Para instalar `Node.js` versión 24 utilizando Node Version Manager.

## Alternativa para Node.js

En caso de que no sea posible instalar Node.js por los medios anteriores, dirigirse a:

- https://nodejs.org/en/download

Estará presente un texto que dice **Or get a prebuilt Node.js®** y a continuación te permite seleccionar el sistema operativo y la arquitectura del procesador de tu equipo.

Descarga el instalador para tu sistema operativo y **lee con cuidado las indicaciones que contiene**

**Selecciona las opciones del instalación de Node.js que mejor te convengan**

Tras finalizar, abre una nueva terminal (o CMD) en tu equipo de cómputo y ejecuta el siguiente comando:
```powershell
node -v
```

Debe mostrarte la versión de Node.js que se instaló. Un ejemplo de salida sería el siguiente:
```powershell
v24.21.0
```



### `uninstall-nvm-node24.ps1`

Revierte la instalación de NVM y Node.js. El procedimiento contempla:

1. Desinstalar globalmente `create-vite` mediante npm.
2. Desinstalar las versiones de Node.js administradas por NVM.
3. Desinstalar NVM mediante Scoop.
4. Limpiar la caché de instalación asociada a NVM.

El script solicita confirmación antes de comenzar. No pretende desinstalar Scoop ni eliminar otros paquetes o buckets compartidos.

Ejecución:

```powershell
.\uninstall-nvm-node24.ps1
```

## 3. Orden recomendado de instalación

Si Scoop todavía no está instalado, ejecuta primero:

```powershell
.\install-scoop.ps1
```

Después, instala Java y Maven:

```powershell
.\install-java-maven.ps1
```

Finalmente, prepara Node.js y Vite:

```powershell
.\install-nvm-node24.ps1
```

Al terminar, el equipo contará con las herramientas principales para desarrollar aplicaciones Spring Boot y React.

## 4. Verificar las instalaciones

Abre una terminal de PowerShell y ejecuta los siguientes comandos.

**Java:**

```powershell
java -version
```

**Maven:**

```powershell
mvn -version
```

**NVM:**

```powershell
nvm version
nvm list
nvm current
```

**Node.js y npm:**

```powershell
node --version
npm --version
```

La versión activa de Node.js debe pertenecer a la línea `24.x`.

## 5. Ejecutar una aplicación Spring Boot

Accede al directorio del backend, donde se encuentra el archivo `pom.xml`.

Para compilar y ejecutar las pruebas:

```powershell
mvn clean verify
```

Para iniciar la aplicación:

```powershell
mvn spring-boot:run
```

La aplicación utilizará el JDK configurado en el entorno. Verifica que `mvn -version` indique Java 17 antes de ejecutarla.

## 6. Crear y ejecutar una aplicación React con Vite

Para generar un proyecto React:

```powershell
npm create vite@latest mi-proyecto -- --template react
```

Accede al directorio generado:

```powershell
cd mi-proyecto
```

Instala las dependencias:

```powershell
npm install
```

Inicia el servidor de desarrollo:

```powershell
npm run dev
```

Vite mostrará en la terminal la dirección local desde la que podrás acceder a la aplicación.

## 7. Consideraciones importantes

- Ejecuta los scripts desde PowerShell 5.1 o una versión compatible posterior.
- Si un script depende de Scoop, asegúrate de que Scoop esté instalado y disponible en `PATH`.
- Si acabas de instalar herramientas o modificaste variables de entorno, puede ser necesario abrir una nueva terminal.
- NVM administra las versiones de Node.js instaladas a través de él; no necesariamente administra instalaciones independientes de Node.js.
- Antes de ejecutar los scripts de desinstalación, revisa las operaciones que realizarán. La desinstalación de NVM puede eliminar todas las versiones de Node.js que administra.
- No elimines buckets compartidos de Scoop si contienen otras herramientas que utilizas.

