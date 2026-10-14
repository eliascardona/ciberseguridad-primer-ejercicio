#Requires -Version 5.1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Instalacion de Java Corretto 17 + Maven" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# 1. Verificar si Scoop esta instalado
# --------------------------------------------------
Write-Host "[1/5] Verificando si Scoop esta instalado..." -ForegroundColor Yellow

if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Scoop ya esta instalado. Se omitira la instalacion." -ForegroundColor Green
}
else {
    Write-Host "Scoop no esta instalado. Instalando Scoop..." -ForegroundColor Yellow

    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        throw "La instalacion de Scoop no se pudo completar correctamente."
    }

    Write-Host "Scoop se instalo correctamente." -ForegroundColor Green
}

Write-Host ""

# --------------------------------------------------
# 2. Agregar bucket java e instalar Corretto 17
# --------------------------------------------------
Write-Host "[2/5] Instalando Java Corretto 17..." -ForegroundColor Yellow

$scoopBuckets = scoop bucket list

if ($scoopBuckets -notmatch "(?m)^\s*java\s") {
    scoop bucket add java

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo agregar el bucket java."
    }
}
else {
    Write-Host "El bucket 'java' ya esta agregado." -ForegroundColor Gray
}

$installedApps = scoop list

if ($installedApps -notmatch "(?m)^\s*corretto17-jdk\s") {
    scoop install java/corretto17-jdk

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo instalar Corretto 17."
    }
}
else {
    Write-Host "Corretto 17 ya esta instalado." -ForegroundColor Gray
}

Write-Host ""

# --------------------------------------------------
# 3. Agregar bucket versions e instalar Maven 3
# --------------------------------------------------
Write-Host "[3/5] Instalando Maven 3..." -ForegroundColor Yellow

$scoopBuckets = scoop bucket list

if ($scoopBuckets -notmatch "(?m)^\s*versions\s") {
    scoop bucket add versions

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo agregar el bucket versions."
    }
}
else {
    Write-Host "El bucket 'versions' ya esta agregado." -ForegroundColor Gray
}

$installedApps = scoop list

if ($installedApps -notmatch "(?m)^\s*maven3\s") {
    scoop install versions/maven3

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo instalar Maven 3."
    }
}
else {
    Write-Host "Maven 3 ya esta instalado." -ForegroundColor Gray
}

Write-Host ""

# --------------------------------------------------
# 4. Configurar JAVA_HOME
# --------------------------------------------------
Write-Host "[4/5] Configurando JAVA_HOME..." -ForegroundColor Yellow

$correttoPath = scoop prefix corretto17-jdk

if (-not $correttoPath -or -not (Test-Path $correttoPath)) {
    throw "No se pudo determinar la ruta de instalacion de Corretto 17."
}

$correttoPath = (Resolve-Path $correttoPath).Path

$currentJavaHome = [System.Environment]::GetEnvironmentVariable(
    "JAVA_HOME",
    "User"
)

if ([string]::IsNullOrWhiteSpace($currentJavaHome)) {
    Write-Host "No existe JAVA_HOME. Se creara apuntando a Corretto 17." -ForegroundColor Gray
}
elseif ($currentJavaHome -ne $correttoPath) {
    Write-Host "JAVA_HOME existente detectado:" -ForegroundColor Gray
    Write-Host "  $currentJavaHome" -ForegroundColor Gray

    [System.Environment]::SetEnvironmentVariable(
        "JAVA_HOME_2",
        $currentJavaHome,
        "User"
    )

    Write-Host "El valor anterior se guardo en JAVA_HOME_2." -ForegroundColor Green
}
else {
    Write-Host "JAVA_HOME ya apunta a Corretto 17." -ForegroundColor Gray
}

[System.Environment]::SetEnvironmentVariable(
    "JAVA_HOME",
    $correttoPath,
    "User"
)

$env:JAVA_HOME = $correttoPath

Write-Host "JAVA_HOME configurado correctamente:" -ForegroundColor Green
Write-Host "  $correttoPath" -ForegroundColor Green

Write-Host ""

# --------------------------------------------------
# 5. Verificar versiones y rutas de instalacion
# --------------------------------------------------
Write-Host "[5/5] Verificando versiones y rutas de instalacion..." -ForegroundColor Yellow
Write-Host ""

# Recargar PATH para esta sesion.
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")

$env:PATH = "$userPath;$machinePath"

# Asegurar que JAVA_HOME/bin tenga prioridad para Java.
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# --------------------------------------------------
# Funcion auxiliar: ejecutar un proceso y capturar
# stdout y stderr sin que PowerShell interprete
# stderr como NativeCommandError.
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

        # Leer ambos flujos asincronamente para evitar
        # bloqueos si alguno de los flujos se llena.
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()

        $process.WaitForExit()

        $stdout = $stdoutTask.Result
        $stderr = $stderrTask.Result
        $exitCode = $process.ExitCode

        return [PSCustomObject]@{
            StdOut   = $stdout
            StdErr   = $stderr
            ExitCode = $exitCode
        }
    }
    finally {
        $process.Dispose()
    }
}

# --------------------------------------------------
# Verificar Java
# --------------------------------------------------
try {
    $javaCommand = Get-Command java -ErrorAction Stop |
        Select-Object -First 1

    $javaExecutablePath = $javaCommand.Source

    if ([string]::IsNullOrWhiteSpace($javaExecutablePath)) {
        throw "No se pudo determinar la ruta del ejecutable de Java."
    }

    $javaResult = Invoke-NativeCommand `
        -FilePath $javaExecutablePath `
        -Arguments "-version"

    if ($javaResult.ExitCode -ne 0) {
        throw "java -version finalizo con codigo $($javaResult.ExitCode). $($javaResult.StdErr)"
    }

    $javaOutput = @(
        $javaResult.StdOut
        $javaResult.StdErr
    ) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object { $_ -split '\r?\n' } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

    $javaVersion = "No se pudo determinar"

    foreach ($line in $javaOutput) {
        if ($line -match 'version "([^"]+)"') {
            $javaVersion = $Matches[1]
            break
        }

        if ($line -match '^openjdk\s+([^\s]+)') {
            $javaVersion = $Matches[1]
            break
        }
    }

    $javaInstallPath = $env:JAVA_HOME

    Write-Host "Java:" -ForegroundColor Cyan
    Write-Host "  Version exacta: $javaVersion" -ForegroundColor Green
    Write-Host "  Ejecutable encontrado: $javaExecutablePath" -ForegroundColor Green
    Write-Host "  Directorio de instalacion (JAVA_HOME): $javaInstallPath" -ForegroundColor Green

    Write-Host ""
    Write-Host "  Salida original de java -version:" -ForegroundColor Gray

    foreach ($line in $javaOutput) {
        Write-Host "    $line" -ForegroundColor Gray
    }
}
catch {
    Write-Host "ERROR: Java no esta disponible o no se pudo verificar." -ForegroundColor Red
    throw
}

Write-Host ""

# --------------------------------------------------
# Verificar Maven
# --------------------------------------------------
try {
    $mavenCommand = Get-Command mvn -ErrorAction Stop |
        Select-Object -First 1

    $mavenExecutablePath = $mavenCommand.Source

    if ([string]::IsNullOrWhiteSpace($mavenExecutablePath)) {
        throw "No se pudo determinar la ruta del ejecutable de Maven."
    }

    $mavenResult = Invoke-NativeCommand `
        -FilePath $mavenExecutablePath `
        -Arguments "-v"

    if ($mavenResult.ExitCode -ne 0) {
        throw "mvn -v finalizo con codigo $($mavenResult.ExitCode). $($mavenResult.StdErr)"
    }

    $mavenOutput = @(
        $mavenResult.StdOut
        $mavenResult.StdErr
    ) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object { $_ -split '\r?\n' } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

    $mavenVersion = "No se pudo determinar"
    $mavenInstallPath = "No se pudo determinar"

    foreach ($line in $mavenOutput) {
        if ($line -match '^Apache Maven\s+([^\s]+)') {
            $mavenVersion = $Matches[1]
        }

        if ($line -match '^Maven home:\s*(.+)$') {
            $mavenInstallPath = $Matches[1].Trim()
        }
    }

    Write-Host "Maven:" -ForegroundColor Cyan
    Write-Host "  Version exacta: $mavenVersion" -ForegroundColor Green
    Write-Host "  Ejecutable encontrado: $mavenExecutablePath" -ForegroundColor Green
    Write-Host "  Directorio de instalacion: $mavenInstallPath" -ForegroundColor Green

    Write-Host ""
    Write-Host "  Salida original de mvn -v:" -ForegroundColor Gray

    foreach ($line in $mavenOutput) {
        Write-Host "    $line" -ForegroundColor Gray
    }
}
catch {
    Write-Host "ERROR: Maven no esta disponible o no se pudo verificar." -ForegroundColor Red
    throw
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " INSTALACION COMPLETADA CORRECTAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Java Corretto 17 y Maven 3 estan instalados y disponibles." -ForegroundColor Green
Write-Host ""
