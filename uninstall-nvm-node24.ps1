#Requires -Version 5.1

$ErrorActionPreference = "Stop"

# --------------------------------------------------
# Encabezado
# --------------------------------------------------
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Desinstalacion de NVM for Windows + Node.js" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script realizara las siguientes operaciones:" -ForegroundColor Yellow
Write-Host "  1. Desinstalar create-vite mediante npm."
Write-Host "  2. Desinstalar las versiones de Node.js administradas por NVM."
Write-Host "  3. Desinstalar NVM mediante Scoop."
Write-Host "  4. Eliminar la cache de instalacion de NVM en Scoop."
Write-Host ""
Write-Host "No se desinstalara Scoop ni se eliminaran otros buckets o aplicaciones." -ForegroundColor Gray
Write-Host "ATENCION: se eliminaran todas las versiones de Node.js administradas por NVM." -ForegroundColor Yellow
Write-Host ""

# --------------------------------------------------
# 0. Confirmar la operacion
# --------------------------------------------------
$confirmation = Read-Host "Escribe SI para continuar"

if ($confirmation -cne "SI") {
    Write-Host "Operacion cancelada. No se realizaron cambios." -ForegroundColor Yellow
    return
}

Write-Host ""

# --------------------------------------------------
# 1. Verificar Scoop
# --------------------------------------------------
Write-Host "[1/4] Verificando Scoop..." -ForegroundColor Yellow

$scoopCommand = Get-Command scoop -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $scoopCommand) {
    Write-Host "ERROR: Scoop no esta disponible en PATH." -ForegroundColor Red
    throw "No se puede continuar sin Scoop."
}

Write-Host "Scoop esta disponible." -ForegroundColor Green

# --------------------------------------------------
# Funciones auxiliares para procesos nativos
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
# 2. Localizar NVM
# --------------------------------------------------
Write-Host ""
Write-Host "[2/4] Localizando NVM y las versiones de Node.js..." -ForegroundColor Yellow

$nvmCommand = Get-Command nvm.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1

if (-not $nvmCommand) {
    $nvmCommand = Get-Command nvm -ErrorAction SilentlyContinue |
        Select-Object -First 1
}

$nvmExecutable = $null

if ($nvmCommand) {
    $nvmExecutable = $nvmCommand.Source
}

# Si NVM no esta en PATH, buscarlo mediante Scoop.
if (-not $nvmExecutable) {
    try {
        $nvmPrefixOutput = & scoop prefix nvm 2>&1

        if ($LASTEXITCODE -eq 0) {
            $nvmInstallDir = ($nvmPrefixOutput | Select-Object -Last 1).ToString().Trim()
            $candidate = Join-Path $nvmInstallDir "nvm.exe"

            if (Test-Path -LiteralPath $candidate) {
                $nvmExecutable = $candidate
            }
        }
    }
    catch {
        # Se informara mas adelante si NVM no esta disponible.
    }
}

if (-not $nvmExecutable) {
    Write-Host "NVM no esta disponible. Se omitira la eliminacion de versiones." -ForegroundColor Yellow
    Write-Host "Se continuara con la limpieza de Scoop." -ForegroundColor Gray
}
else {
    Write-Host "NVM encontrado: $nvmExecutable" -ForegroundColor Green

    # --------------------------------------------------
    # 2.1. Desinstalar create-vite mediante npm
    # --------------------------------------------------
    Write-Host ""
    Write-Host "Desinstalando create-vite mediante npm..." -ForegroundColor Yellow

    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if (-not $npmCommand) {
        $npmCommand = Get-Command npm -ErrorAction SilentlyContinue |
            Select-Object -First 1
    }

    if ($npmCommand) {
        $npmExecutable = $npmCommand.Source

        $uninstallViteResult = Invoke-CmdCommand `
            -CommandPath $npmExecutable `
            -Arguments "uninstall --global create-vite"

        Write-CommandOutput `
            -StdOut $uninstallViteResult.StdOut `
            -StdErr $uninstallViteResult.StdErr

        if ($uninstallViteResult.ExitCode -ne 0) {
            throw "No se pudo desinstalar create-vite. Codigo: $($uninstallViteResult.ExitCode). Se detendra el proceso."
        }

        Write-Host "create-vite se desinstalo correctamente, si estaba instalado." -ForegroundColor Green
    }
    else {
        Write-Host "ADVERTENCIA: npm no esta disponible en PATH." -ForegroundColor Yellow
        Write-Host "Se continuara; las versiones de Node.js se eliminaran mediante NVM." -ForegroundColor Gray
    }

    # --------------------------------------------------
    # 2.2. Obtener las versiones administradas por NVM
    # --------------------------------------------------
    Write-Host ""
    Write-Host "Consultando las versiones instaladas..." -ForegroundColor Yellow

    $listResult = Invoke-NativeCommand `
        -FilePath $nvmExecutable `
        -Arguments "list"

    Write-CommandOutput `
        -StdOut $listResult.StdOut `
        -StdErr $listResult.StdErr

    if ($listResult.ExitCode -ne 0) {
        throw "No se pudieron consultar las versiones de Node.js. No se eliminara NVM."
    }

    $listText = $listResult.StdOut + "`n" + $listResult.StdErr

    # Extraer versiones completas, por ejemplo 24.11.1.
    # No se utiliza 'list available', para no confundir versiones remotas
    # con las que realmente estan instaladas.
    $versions = @(
        [regex]::Matches(
            $listText,
            '(?im)^\s*(?:\*\s*)?[vV]?(\d+\.\d+\.\d+)\b'
        ) |
        ForEach-Object {
            $_.Groups[1].Value
        } |
        Select-Object -Unique
    )

    # --------------------------------------------------
    # 2.3. Desinstalar todas las versiones encontradas
    # --------------------------------------------------
    if ($versions.Count -eq 0) {
        Write-Host "No se encontraron versiones instaladas de Node.js." -ForegroundColor Gray
    }
    else {
        Write-Host ""
        Write-Host "Se eliminaran las siguientes versiones:" -ForegroundColor Cyan

        foreach ($version in $versions) {
            Write-Host "  - $version" -ForegroundColor Gray
        }

        foreach ($version in $versions) {
            Write-Host ""
            Write-Host "Desinstalando Node.js $version..." -ForegroundColor Yellow

            $uninstallResult = Invoke-NativeCommand `
                -FilePath $nvmExecutable `
                -Arguments "uninstall $version --purge"

            Write-CommandOutput `
                -StdOut $uninstallResult.StdOut `
                -StdErr $uninstallResult.StdErr

            if ($uninstallResult.ExitCode -ne 0) {
                throw "No se pudo desinstalar Node.js $version. NVM se conservara para permitir la correccion del problema."
            }

            Write-Host "Node.js $version se desinstalo correctamente." -ForegroundColor Green
        }
    }

    # Verificar que no queden versiones administradas por NVM.
    $remainingResult = Invoke-NativeCommand `
        -FilePath $nvmExecutable `
        -Arguments "list"

    if ($remainingResult.ExitCode -ne 0) {
        throw "No se pudo verificar la eliminacion de las versiones. NVM se conservara."
    }

    $remainingText = $remainingResult.StdOut + "`n" + $remainingResult.StdErr

    $remainingVersions = @(
        [regex]::Matches(
            $remainingText,
            '(?im)^\s*(?:\*\s*)?[vV]?(\d+\.\d+\.\d+)\b'
        ) |
        ForEach-Object {
            $_.Groups[1].Value
        } |
        Select-Object -Unique
    )

    if ($remainingVersions.Count -gt 0) {
        Write-Host "Versiones que aun aparecen instaladas:" -ForegroundColor Red

        foreach ($version in $remainingVersions) {
            Write-Host "  - $version" -ForegroundColor Red
        }

        throw "Quedan versiones de Node.js. No se desinstalara NVM."
    }

    Write-Host ""
    Write-Host "Todas las versiones de Node.js administradas por NVM fueron eliminadas." -ForegroundColor Green
}

# --------------------------------------------------
# 3. Desinstalar NVM mediante Scoop
# --------------------------------------------------
Write-Host ""
Write-Host "[3/4] Desinstalando NVM mediante Scoop..." -ForegroundColor Yellow

# --purge solicita eliminar tambien los datos persistentes de NVM.
# No elimina Scoop ni otros paquetes.
scoop uninstall nvm --purge

Write-Host "NVM se desinstalo mediante Scoop." -ForegroundColor Green

# --------------------------------------------------
# 4. Eliminar cache de descarga de NVM
# --------------------------------------------------
Write-Host ""
Write-Host "[4/4] Limpiando la cache de Scoop asociada a NVM..." -ForegroundColor Yellow

try {
    scoop cache rm nvm

    Write-Host "Cache de descarga de NVM limpiada, si existia." -ForegroundColor Green
}
catch {
    Write-Host "ADVERTENCIA: no se pudo limpiar la cache de NVM." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host "La desinstalacion de NVM ya se realizo; la cache puede limpiarse manualmente." -ForegroundColor Gray
}

# --------------------------------------------------
# Resumen
# --------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " DESINSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "create-vite: se solicito su desinstalacion mediante npm." -ForegroundColor Green
Write-Host "Node.js: se eliminaron las versiones administradas por NVM." -ForegroundColor Green
Write-Host "NVM for Windows: desinstalado mediante Scoop." -ForegroundColor Green
Write-Host "Cache de NVM en Scoop: limpieza solicitada." -ForegroundColor Green
Write-Host ""
Write-Host "Scoop y sus otros paquetes se conservaron." -ForegroundColor Gray
Write-Host "No se eliminaron buckets compartidos como main o versions." -ForegroundColor Gray
Write-Host ""
Write-Host "Abre una nueva terminal para actualizar el entorno de la sesion." -ForegroundColor Yellow
Write-Host ""
