#Requires -Version 5.1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Instalacion de Java Corretto 17 + Maven" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# 1. Verificar si Scoop esta instalado
# --------------------------------------------------
Write-Host "[1/4] Verificando si Scoop esta instalado..." -ForegroundColor Yellow

if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Scoop ya esta instalado. Se omitira la instalacion." -ForegroundColor Green
}
else {
    Write-Host "Scoop no esta instalado. Instalando Scoop..." -ForegroundColor Yellow

    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

    # Verificar que Scoop se haya instalado correctamente
    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        throw "La instalacion de Scoop no se pudo completar correctamente."
    }

    Write-Host "Scoop se instalo correctamente." -ForegroundColor Green
}

Write-Host ""

# --------------------------------------------------
# 2. Agregar bucket java e instalar Corretto 17
# --------------------------------------------------
Write-Host "[2/4] Instalando Java Corretto 17..." -ForegroundColor Yellow

# Agregar bucket java si aun no existe
$scoopBuckets = scoop bucket list

if ($scoopBuckets -notmatch "java") {
    scoop bucket add java
}
else {
    Write-Host "El bucket 'java' ya esta agregado." -ForegroundColor Gray
}

# Verificar si Corretto 17 ya esta instalado
$installedApps = scoop list

if ($installedApps -notmatch "corretto17-jdk") {
    scoop install java/corretto17-jdk
}
else {
    Write-Host "Corretto 17 ya esta instalado." -ForegroundColor Gray
}

Write-Host ""

# --------------------------------------------------
# 3. Agregar bucket versions e instalar Maven 3
# --------------------------------------------------
Write-Host "[3/4] Instalando Maven 3..." -ForegroundColor Yellow

# Agregar bucket versions si aun no existe
$scoopBuckets = scoop bucket list

if ($scoopBuckets -notmatch "versions") {
    scoop bucket add versions
}
else {
    Write-Host "El bucket 'versions' ya esta agregado." -ForegroundColor Gray
}

# Verificar si Maven 3 ya esta instalado
$installedApps = scoop list

if ($installedApps -notmatch "maven3") {
    scoop install versions/maven3
}
else {
    Write-Host "Maven 3 ya esta instalado." -ForegroundColor Gray
}

Write-Host ""

# --------------------------------------------------
# 4. Configurar JAVA_HOME
# --------------------------------------------------
Write-Host "[4/5] Configurando JAVA_HOME..." -ForegroundColor Yellow

# Obtener la ruta real de Corretto 17 instalada por Scoop
$correttoPath = scoop prefix corretto17-jdk

if (-not $correttoPath -or -not (Test-Path $correttoPath)) {
    throw "No se pudo determinar la ruta de instalacion de Corretto 17."
}

$correttoPath = (Resolve-Path $correttoPath).Path

# Obtener el JAVA_HOME actual a nivel de usuario
$currentJavaHome = [System.Environment]::GetEnvironmentVariable(
    "JAVA_HOME",
    "User"
)

if ([string]::IsNullOrWhiteSpace($currentJavaHome)) {
    Write-Host "No existe JAVA_HOME. Se creara apuntando a Corretto 17." -ForegroundColor Gray
}
else {
    Write-Host "JAVA_HOME existente detectado:" -ForegroundColor Gray
    Write-Host "  $currentJavaHome" -ForegroundColor Gray

    # Guardar el valor anterior en JAVA_HOME_2
    [System.Environment]::SetEnvironmentVariable(
        "JAVA_HOME_2",
        $currentJavaHome,
        "User"
    )

    Write-Host "El valor anterior se guardo en JAVA_HOME_2." -ForegroundColor Green
}

# Establecer JAVA_HOME apuntando a Corretto 17
[System.Environment]::SetEnvironmentVariable(
    "JAVA_HOME",
    $correttoPath,
    "User"
)

# Actualizar tambien la variable en la sesion actual
$env:JAVA_HOME = $correttoPath

Write-Host "JAVA_HOME configurado correctamente:" -ForegroundColor Green
Write-Host "  $correttoPath" -ForegroundColor Green

Write-Host ""

# --------------------------------------------------
# 5. Verificar versiones
# --------------------------------------------------
Write-Host "[5/5] Verificando las versiones instaladas..." -ForegroundColor Yellow
Write-Host ""

# Recargar PATH para que las aplicaciones instaladas por Scoop
# esten disponibles en la sesion actual.
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "Machine")

# Verificar Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo ejecutar Java."
    }

    Write-Host "Java:" -ForegroundColor Cyan
    Write-Host "  $javaVersion" -ForegroundColor Green

    Write-Host "JAVA_HOME:" -ForegroundColor Cyan
    Write-Host "  $env:JAVA_HOME" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Java no esta disponible en el PATH." -ForegroundColor Red
    throw
}

Write-Host ""

# Verificar Maven
try {
    $mavenVersion = mvn -version 2>&1

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo ejecutar Maven."
    }

    Write-Host "Maven:" -ForegroundColor Cyan
    $mavenVersion | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Green
    }
}
catch {
    Write-Host "ERROR: Maven no esta disponible en el PATH." -ForegroundColor Red
    throw
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " INSTALACION COMPLETADA CORRECTAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Java Corretto 17 y Maven 3 estan instalados y disponibles." -ForegroundColor Green
Write-Host ""
