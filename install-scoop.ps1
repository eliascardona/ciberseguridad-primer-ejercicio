#Requires -Version 5.1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Instalacion de Scoop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --------------------------------------------------
# Descripcion de Scoop
# --------------------------------------------------
Write-Host "¿Que es Scoop?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Scoop es un gestor de paquetes para Windows que permite" -ForegroundColor Gray
Write-Host "instalar, actualizar y desinstalar herramientas de desarrollo" -ForegroundColor Gray
Write-Host "desde PowerShell, sin depender de instaladores graficos." -ForegroundColor Gray
Write-Host ""
Write-Host "Por defecto, instala aplicaciones en el perfil del usuario," -ForegroundColor Gray
Write-Host "lo que facilita administrar herramientas sin requerir permisos" -ForegroundColor Gray
Write-Host "de administrador en la mayoria de los casos." -ForegroundColor Gray
Write-Host ""

# --------------------------------------------------
# 1. Verificar si Scoop ya esta instalado
# --------------------------------------------------
Write-Host "[1/2] Verificando si Scoop esta instalado..." -ForegroundColor Yellow

if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Scoop ya esta instalado." -ForegroundColor Green

    $scoopVersion = scoop --version

    Write-Host "Version detectada: $scoopVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "No se realizaron cambios." -ForegroundColor Gray
    exit 0
}

# --------------------------------------------------
# 2. Instalar Scoop
# --------------------------------------------------
Write-Host "[2/2] Preparando la instalacion de Scoop..." -ForegroundColor Yellow

try {
    # Configurar la politica de ejecucion solo para el usuario actual.
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

    Write-Host "Descargando y ejecutando el instalador oficial..." -ForegroundColor Gray

    Invoke-RestMethod -Uri "https://get.scoop.sh" | Invoke-Expression

    # Comprobar que Scoop este disponible.
    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        # Actualizar el PATH de la sesion por si Scoop acaba de instalarse.
        $userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")

        if (-not [string]::IsNullOrWhiteSpace($userPath)) {
            $env:PATH = "$userPath;$env:PATH"
        }
    }

    if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
        throw "La instalacion termino, pero el comando scoop no esta disponible en esta sesion."
    }

    Write-Host ""
    Write-Host "Scoop se instalo correctamente." -ForegroundColor Green

    $scoopVersion = scoop --version
    Write-Host "Version instalada: $scoopVersion" -ForegroundColor Green

    Write-Host ""
    Write-Host "Ubicacion de Scoop:" -ForegroundColor Cyan
    Write-Host "  $((Get-Command scoop).Source)" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " INSTALACION COMPLETADA CORRECTAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Scoop esta listo para utilizarse." -ForegroundColor Green
    Write-Host "No se instalaron aplicaciones ni buckets adicionales." -ForegroundColor Gray
    Write-Host ""

}
catch {
    Write-Host ""
    Write-Host "ERROR: No se pudo completar la instalacion de Scoop." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}