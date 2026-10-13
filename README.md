# Almost everything is done

## Steps to run the app


**NOTE: Use these commands with caution, always review official sources**

1. Download the current GitHub repository in the way you want

2. Once downloaded, run:

```
cd /path/to/your_downloaded_folder
```

and

```
docker compose up
```

3. Either if any contributor updates the repository or you change your local code, please run:


```
docker compose up --build
```
once you are inside the project's folder.

* From now on, when changes are applied to the codebase, it will be needed to add the `--build` flag to the `docker compose up` command.

