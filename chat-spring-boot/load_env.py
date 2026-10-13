import os
import subprocess
import sys

def load_env(env_file=".env"):
    with open(env_file, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            # Ignorar líneas vacías y comentarios
            if not line or line.startswith("#"):
                continue

            # Separar el nombre y el valor
            if "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()

            # Eliminar comillas exteriores
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                value = value[1:-1]

            # Establecer la variable en Windows
            os.environ[key] = value

            # Imprimir el comando que debe ejecutar PowerShell
            print(f"$env:{key} = '{value.replace(chr(39), chr(39) * 2)}'")

if __name__ == "__main__":
    env_file = sys.argv[1] if len(sys.argv) > 1 else ".env"
    load_env(env_file)
