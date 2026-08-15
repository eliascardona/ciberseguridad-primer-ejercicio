# Seems that everything is done :P

## Steps to run the app

1. Install Docker and Docker Compose

Generally, if you are a developer user, you might already have these installed on your OS, but countercase, a comand that AI suggested to run for MacOS users was:

```
softwareupdate --install-rosetta
```

.

```
brew install colima docker docker-compose docker-buildx docker-credential-helper
```

**Use these commands with caution, always review official sources**


2. Download the current GitHub repository in the way you want

3. Once downloaded, run:

```
cd /path/to/your_downloaded_folder
```

and

```
docker compose up
```

4. If any contributor updates the repository, please run:


```
docker compose up
```

once you are inside the project's folder.



