#Requires -Version 5.1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Desinstalacion de Java Corretto 17 + Maven" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# 1. Verificar Scoop
# --------------------------------------------------
Write-Host "[1/5] Verificando Scoop..." -ForegroundColor Yellow

if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
    Write-Host "Scoop no esta disponible en esta sesion." -ForegroundColor Red
    Write-Host "No se realizaron cambios." -ForegroundColor Yellow
    exit 1
}

Write-Host "Scoop esta instalado." -ForegroundColor Green
Write-Host ""

# --------------------------------------------------
# 2. Confirmar operaciones
# --------------------------------------------------
Write-Host "Se realizaran las siguientes operaciones:" -ForegroundColor Yellow
Write-Host "  - Desinstalar Corretto 17, si esta instalado."
Write-Host "  - Desinstalar Maven 3, si esta instalado."
Write-Host "  - Eliminar los buckets java y versions, si existen."
Write-Host "  - Eliminar la cache de descargas de Scoop."
Write-Host "  - Restaurar JAVA_HOME cuando exista un valor anterior guardado."
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "La cache de Scoop puede contener descargas de otras aplicaciones."
Write-Host "La cache completa se eliminara, pero no se desinstalaran otras aplicaciones."
Write-Host "Scoop permanecera instalado."
Write-Host ""

$confirmation = Read-Host "Escribe SI para continuar"

if ($confirmation -cne "SI") {
    Write-Host "Operacion cancelada. No se realizaron cambios." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# --------------------------------------------------
# Funciones auxiliares
# --------------------------------------------------
$script:Failures = [System.Collections.Generic.List[string]]::new()

function Invoke-ScoopRemoval {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Description,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Operation
    )

    Write-Host "$Description..." -ForegroundColor Yellow

    try {
        & $Operation

        if ($LASTEXITCODE -ne 0) {
            throw "Scoop devolvio el codigo de salida $LASTEXITCODE."
        }

        Write-Host "  Correcto: $Description" -ForegroundColor Green
    }
    catch {
        $message = "$Description : $($_.Exception.Message)"
        $script:Failures.Add($message)

        Write-Host "  ERROR: $message" -ForegroundColor Red
    }
}

# --------------------------------------------------
# 3. Desinstalar aplicaciones
# --------------------------------------------------
Write-Host "[2/5] Desinstalando aplicaciones..." -ForegroundColor Yellow

try {
    $installedApps = @(scoop list | Out-String)

    if ($installedApps -match "(?im)^\s*corretto17-jdk(?:\s|$)") {
        Invoke-ScoopRemoval `
            -Description "Desinstalando Corretto 17" `
            -Operation { scoop uninstall corretto17-jdk }
    }
    else {
        Write-Host "Corretto 17 no esta instalado. Se omite." -ForegroundColor Gray
    }

    # Volver a consultar el inventario despues de desinstalar Java.
    $installedApps = @(scoop list | Out-String)

    if ($installedApps -match "(?im)^\s*maven3(?:\s|$)") {
        Invoke-ScoopRemoval `
            -Description "Desinstalando Maven 3" `
            -Operation { scoop uninstall maven3 }
    }
    else {
        Write-Host "Maven 3 no esta instalado. Se omite." -ForegroundColor Gray
    }
}
catch {
    $script:Failures.Add("No se pudo consultar el inventario de Scoop: $($_.Exception.Message)")
    Write-Host "ERROR al consultar las aplicaciones instaladas." -ForegroundColor Red
}

Write-Host ""

# --------------------------------------------------
# 4. Eliminar buckets
# --------------------------------------------------
Write-Host "[3/5] Eliminando buckets de Scoop..." -ForegroundColor Yellow

try {
    $scoopBuckets = scoop bucket list | Out-String

    if ($scoopBuckets -match "(?im)^\s*java\s") {
        Invoke-ScoopRemoval `
            -Description "Eliminando bucket java" `
            -Operation { scoop bucket rm java }
    }
    else {
        Write-Host "El bucket java no existe. Se omite." -ForegroundColor Gray
    }

    # Volver a consultar los buckets para verificar su estado.
    $scoopBuckets = scoop bucket list | Out-String

    if ($scoopBuckets -match "(?im)^\s*versions\s") {
        Invoke-ScoopRemoval `
            -Description "Eliminando bucket versions" `
            -Operation { scoop bucket rm versions }
    }
    else {
        Write-Host "El bucket versions no existe. Se omite." -ForegroundColor Gray
    }
}
catch {
    $script:Failures.Add("No se pudieron consultar los buckets: $($_.Exception.Message)")
    Write-Host "ERROR al consultar los buckets de Scoop." -ForegroundColor Red
}

Write-Host ""

# --------------------------------------------------
# 5. Eliminar cache de Scoop
# --------------------------------------------------
Write-Host "[4/5] Eliminando cache de descargas..." -ForegroundColor Yellow

try {
    $scoopRoot = if ($env:SCOOP) {
        $env:SCOOP
    }
    else {
        Join-Path $HOME "scoop"
    }

    $cachePath = if ($env:SCOOP_CACHE) {
        $env:SCOOP_CACHE
    }
    else {
        Join-Path $scoopRoot "cache"
    }

    if (Test-Path -LiteralPath $cachePath) {
        Write-Host "Directorio de cache: $cachePath" -ForegroundColor Gray

        Invoke-ScoopRemoval `
            -Description "Limpiando cache de Scoop" `
            -Operation {
                scoop cache rm *
            }

        if (Test-Path -LiteralPath $cachePath) {
            $remainingFiles = @(Get-ChildItem -LiteralPath $cachePath -Force -ErrorAction SilentlyContinue)

            if ($remainingFiles.Count -gt 0) {
                $script:Failures.Add(
                    "La cache conserva $($remainingFiles.Count) elementos: $cachePath"
                )
                Write-Host "  ADVERTENCIA: quedan elementos en la cache." -ForegroundColor Yellow
            }
            else {
                Write-Host "  Cache vacia." -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "No existe el directorio de cache. Se omite." -ForegroundColor Gray
    }
}
catch {
    $script:Failures.Add("Error al limpiar la cache: $($_.Exception.Message)")
    Write-Host "ERROR al limpiar la cache." -ForegroundColor Red
}

Write-Host ""

# --------------------------------------------------
# Restaurar JAVA_HOME
# --------------------------------------------------
Write-Host "[5/5] Restaurando JAVA_HOME..." -ForegroundColor Yellow

try {
    $previousJavaHome = [System.Environment]::GetEnvironmentVariable(
        "JAVA_HOME_2",
        "User"
    )

    if (-not [string]::IsNullOrWhiteSpace($previousJavaHome)) {
        [System.Environment]::SetEnvironmentVariable(
            "JAVA_HOME",
            $previousJavaHome,
            "User"
        )

        $env:JAVA_HOME = $previousJavaHome

        [System.Environment]::SetEnvironmentVariable(
            "JAVA_HOME_2",
            $null,
            "User"
        )

        Write-Host "JAVA_HOME restaurado al valor anterior:" -ForegroundColor Green
        Write-Host "  $previousJavaHome" -ForegroundColor Green
        Write-Host "JAVA_HOME_2 eliminado." -ForegroundColor Green
    }
    else {
        [System.Environment]::SetEnvironmentVariable(
            "JAVA_HOME",
            $null,
            "User"
        )

        Remove-Item Env:JAVA_HOME -ErrorAction SilentlyContinue

        Write-Host "No habia un JAVA_HOME anterior guardado." -ForegroundColor Gray
        Write-Host "JAVA_HOME se elimino del entorno de usuario." -ForegroundColor Green
    }
}
catch {
    $script:Failures.Add("No se pudo restaurar JAVA_HOME: $($_.Exception.Message)")
    Write-Host "ERROR al restaurar JAVA_HOME." -ForegroundColor Red
}

Write-Host ""

# --------------------------------------------------
# Resumen final
# --------------------------------------------------
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESUMEN DE DESINSTALACION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($script:Failures.Count -eq 0) {
    Write-Host "Proceso finalizado sin errores reportados." -ForegroundColor Green
}
else {
    Write-Host "El proceso termino con $($script:Failures.Count) problema(s)." -ForegroundColor Red

    foreach ($failure in $script:Failures) {
        Write-Host "  - $failure" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Corretto 17 y Maven 3: se intento retirar si estaban instalados." -ForegroundColor Gray
Write-Host "Buckets java y versions: se intento retirar si existian." -ForegroundColor Gray
Write-Host "Cache de Scoop: se intento limpiar." -ForegroundColor Gray
Write-Host "Scoop y las demas aplicaciones se conservaron." -ForegroundColor Gray
Write-Host ""
Write-Host "Nota: las terminales ya abiertas pueden conservar valores antiguos de PATH." -ForegroundColor Yellow
Write-Host ""

if ($script:Failures.Count -gt 0) {
    exit 1
}
