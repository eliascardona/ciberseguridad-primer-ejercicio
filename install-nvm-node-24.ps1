#Requires -Version 5.1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Instalacion de NVM y Node.js 24" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# Descripcion de NVM
# --------------------------------------------------
Write-Host "¿Que es NVM (Node Version Manager)?" -ForegroundColor Yellow
Write-Host ""
Write-Host "NVM for Windows es un gestor de versiones de Node.js." -ForegroundColor Gray
Write-Host "Permite instalar varias versiones de Node.js y cambiar" -ForegroundColor Gray
Write-Host "entre ellas sin tener que reinstalar manualmente cada version." -ForegroundColor Gray
Write-Host ""
Write-Host "Este script instalara Node.js 24 y lo configurara como" -ForegroundColor Gray
Write-Host "la version activa mediante NVM." -ForegroundColor Gray
Write-Host ""
Write-Host "Nota: no se instalara ni verificara Scoop." -ForegroundColor Gray
Write-Host ""


# --------------------------------------------------
# 0. Verificar Scoop antes de continuar
# --------------------------------------------------
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Preparacion del entorno React + Vite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificando Scoop..." -ForegroundColor Yellow

$scoopCommand = Get-Command scoop -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $scoopCommand) {
    Write-Host "ERROR: Scoop no esta instalado o no esta disponible en PATH." -ForegroundColor Red
    Write-Host "Instala Scoop y vuelve a ejecutar este script." -ForegroundColor Yellow
    throw "No se puede continuar sin Scoop."
}

Write-Host "Scoop esta disponible." -ForegroundColor Green
Write-Host ""

# --------------------------------------------------
# Funcion auxiliar para ejecutar procesos nativos
# Evita problemas con stderr en PowerShell 5.1
# --------------------------------------------------
function Invoke-NativeCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $false)]
        [string]$Arguments = ""
    )

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $FilePath
    $processInfo.Arguments = $Arguments
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo

    try {
        [void]$process.Start()

        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()

        $process.WaitForExit()

        return [PSCustomObject]@{
            StdOut   = $stdoutTask.Result
            StdErr   = $stderrTask.Result
            ExitCode = $process.ExitCode
        }
    }
    finally {
        $process.Dispose()
    }
}

# --------------------------------------------------
# Funcion para imprimir stdout y stderr
# --------------------------------------------------
function Write-CommandOutput {
    param(
        [string]$StdOut,
        [string]$StdErr
    )

    foreach ($stream in @($StdOut, $StdErr)) {
        if (-not [string]::IsNullOrWhiteSpace($stream)) {
            foreach ($line in ($stream -split '\r?\n')) {
                if (-not [string]::IsNullOrWhiteSpace($line)) {
                    Write-Host "  $line" -ForegroundColor Gray
                }
            }
        }
    }
}

# --------------------------------------------------
# Funcion para ejecutar archivos .cmd mediante cmd.exe
# --------------------------------------------------
function Invoke-CmdCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandPath,

        [Parameter(Mandatory = $false)]
        [string]$Arguments = ""
    )

    $cmdArguments = '/d /s /c ""' +
        $CommandPath +
        '" ' +
        $Arguments +
        '"'

    return Invoke-NativeCommand `
        -FilePath $env:ComSpec `
        -Arguments $cmdArguments
}

# --------------------------------------------------
# 1. Instalar NVM mediante Scoop
# --------------------------------------------------
Write-Host "[1/5] Instalando NVM for Windows mediante Scoop..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Ejecutando: scoop install nvm" -ForegroundColor Gray

# Scoop utiliza el bucket main para el paquete nvm.
# Si ya esta instalado, Scoop informara que no necesita reinstalarlo.
scoop install nvm

Write-Host ""
Write-Host "NVM se encuentra instalado mediante Scoop." -ForegroundColor Green

# --------------------------------------------------
# 2. Localizar NVM y actualizar PATH de la sesion
# --------------------------------------------------
Write-Host ""
Write-Host "[2/5] Localizando NVM y actualizando el entorno..." -ForegroundColor Yellow

# Detectar la ubicacion de Scoop.
$scoopRoot = $env:SCOOP

if ([string]::IsNullOrWhiteSpace($scoopRoot)) {
    $scoopRoot = Join-Path $env:USERPROFILE "scoop"
}

$scoopShims = Join-Path $scoopRoot "shims"

# Actualizar PATH desde las variables persistentes de Windows.
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")

$pathEntries = @(
    $userPath -split ';'
    $machinePath -split ';'
    $scoopShims
    (Join-Path $env:APPDATA "npm")
) | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_)
} | Select-Object -Unique

$env:PATH = $pathEntries -join ";"

# Obtener la ruta real de la instalacion de NVM.
$nvmInstallDir = (& scoop prefix nvm | Select-Object -Last 1)

if ($LASTEXITCODE -ne 0 -or
    [string]::IsNullOrWhiteSpace($nvmInstallDir)) {
    throw "No se pudo determinar la ubicacion de NVM mediante Scoop."
}

$nvmInstallDir = $nvmInstallDir.Trim()
$nvmExecutable = Join-Path $nvmInstallDir "nvm.exe"

if (-not (Test-Path -LiteralPath $nvmExecutable)) {
    throw "No se encontro nvm.exe en: $nvmInstallDir"
}

Write-Host "Directorio de NVM: $nvmInstallDir" -ForegroundColor Green

# Consultar la version instalada.
$nvmVersionResult = Invoke-NativeCommand `
    -FilePath $nvmExecutable `
    -Arguments "version"

Write-CommandOutput `
    -StdOut $nvmVersionResult.StdOut `
    -StdErr $nvmVersionResult.StdErr

if ($nvmVersionResult.ExitCode -ne 0) {
    throw "No se pudo consultar la version de NVM."
}

# --------------------------------------------------
# 3. Instalar Node.js 24
# --------------------------------------------------
Write-Host ""
Write-Host "[3/5] Instalando Node.js 24..." -ForegroundColor Yellow
Write-Host "Se instalara la version mas reciente disponible de la linea 24.x." -ForegroundColor Gray
Write-Host ""

$installResult = Invoke-NativeCommand `
    -FilePath $nvmExecutable `
    -Arguments "install 24"

Write-CommandOutput `
    -StdOut $installResult.StdOut `
    -StdErr $installResult.StdErr

if ($installResult.ExitCode -ne 0) {
    throw "No se pudo instalar Node.js 24. Codigo: $($installResult.ExitCode)"
}

Write-Host "Node.js 24 se instalo correctamente." -ForegroundColor Green

# --------------------------------------------------
# 4. Activar Node.js 24 y verificar Node.js y npm
# --------------------------------------------------
Write-Host ""
Write-Host "[4/5] Activando Node.js 24..." -ForegroundColor Yellow

$useResult = Invoke-NativeCommand `
    -FilePath $nvmExecutable `
    -Arguments "use 24"

Write-CommandOutput `
    -StdOut $useResult.StdOut `
    -StdErr $useResult.StdErr

if ($useResult.ExitCode -ne 0) {
    throw "No se pudo activar Node.js 24. Codigo: $($useResult.ExitCode)"
}

# NVM v2 puede administrar Node.js mediante shims.
# Agregar la ruta persistente de Scoop a la sesion actual.
$nodeLinkDir = Join-Path $scoopRoot "persist\nvm\.nodejs"

if (Test-Path -LiteralPath $nodeLinkDir) {
    $env:PATH = "$nodeLinkDir;$env:PATH"
}

Write-Host ""
Write-Host "Verificando Node.js..." -ForegroundColor Cyan

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $nodeCommand) {
    throw "Node.js se activo, pero el comando node no esta disponible en PATH."
}

$nodeResult = Invoke-NativeCommand `
    -FilePath $nodeCommand.Source `
    -Arguments "--version"

if ($nodeResult.ExitCode -ne 0) {
    throw "No se pudo ejecutar node --version."
}

$nodeVersion = ($nodeResult.StdOut + $nodeResult.StdErr).Trim()

if ($nodeVersion -notmatch '^v24\.') {
    throw "Se esperaba Node.js 24, pero se detecto: $nodeVersion"
}

Write-Host "  Version: $nodeVersion" -ForegroundColor Green
Write-Host "  Ejecutable: $($nodeCommand.Source)" -ForegroundColor Gray

Write-Host ""
Write-Host "Verificando npm..." -ForegroundColor Cyan

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $npmCommand) {
    $npmCommand = Get-Command npm -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

if (-not $npmCommand) {
    throw "No se encontro npm. Comprueba la instalacion de Node.js 24."
}

$npmExecutable = $npmCommand.Source

# npm suele distribuirse como npm.cmd en Windows.
$npmResult = Invoke-CmdCommand `
    -CommandPath $npmExecutable `
    -Arguments "--version"

if ($npmResult.ExitCode -ne 0) {
    throw "No se pudo ejecutar npm --version."
}

$npmVersion = ($npmResult.StdOut + $npmResult.StdErr).Trim()

Write-Host "  Version: $npmVersion" -ForegroundColor Green
Write-Host "  Ejecutable: $npmExecutable" -ForegroundColor Gray

# --------------------------------------------------
# 5. Instalar y verificar create-vite
# --------------------------------------------------
Write-Host ""
Write-Host "[5/5] Instalando create-vite globalmente..." -ForegroundColor Yellow

$createViteResult = Invoke-CmdCommand `
    -CommandPath $npmExecutable `
    -Arguments "install --global create-vite"

Write-CommandOutput `
    -StdOut $createViteResult.StdOut `
    -StdErr $createViteResult.StdErr

if ($createViteResult.ExitCode -ne 0) {
    throw "No se pudo instalar create-vite. Codigo: $($createViteResult.ExitCode)"
}

Write-Host "create-vite se instalo correctamente." -ForegroundColor Green

# Actualizar PATH para localizar los ejecutables globales de npm.
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")

$pathEntries = @(
    $userPath -split ';'
    $machinePath -split ';'
    $scoopShims
    (Join-Path $env:APPDATA "npm")
    $nodeLinkDir
) | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_)
} | Select-Object -Unique

$env:PATH = $pathEntries -join ";"


Write-Host "  Ejecutable: $createViteExecutable" -ForegroundColor Green
Write-Host "  Version:" -ForegroundColor Cyan

Write-CommandOutput `
    -StdOut $createViteVersion.StdOut `
    -StdErr $createViteVersion.StdErr

# --------------------------------------------------
# Resumen final
# --------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ENTORNO DE DESARROLLO PREPARADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Scoop: disponible." -ForegroundColor Green
Write-Host "NVM for Windows: instalado mediante Scoop." -ForegroundColor Green
Write-Host "Node.js 24: instalado y activado." -ForegroundColor Green
Write-Host "npm: verificado." -ForegroundColor Green
Write-Host "create-vite: instalado y verificado." -ForegroundColor Green
Write-Host ""
Write-Host "Para crear un proyecto React con Vite:" -ForegroundColor Yellow
Write-Host "  npm create vite@latest mi-proyecto -- --template react" -ForegroundColor Gray
Write-Host ""
Write-Host "Despues, ejecuta:" -ForegroundColor Yellow
Write-Host "  cd mi-proyecto" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Si algun comando no se reconoce en otra terminal," -ForegroundColor Gray
Write-Host "abre una nueva sesion de PowerShell y vuelve a verificar." -ForegroundColor Gray
Write-Host ""
