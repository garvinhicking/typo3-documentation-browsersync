# typo3-documentation-browsersync

TL;DR:

```
docker run --rm -it --pull always \
         -v "./Documentation:/project/Documentation" \
         -v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp" \
         -p 5173:5173 ghcr.io/garvinhicking/typo3-documentation-browsersync:latest
```


## Introduction

Standalone project (NodeJS, browsersync) to render and hot-reload changes 
in TYPO3 ReST documentation to your browser window.

The files are rendered through the official https://github.com/TYPO3-documentation/render-guides
project. Please see https://docs.typo3.org/m/typo3/docs-how-to-document/main/en-us/WritingDocForExtension/Index.html
for more information on TYPO3 documentations.

This project exists to be build and used as a Docker container. It's not meant
to run natively, because it would require a lot of dependencies (PHP, composer, NodeJS,
nvm) and the underlying `TYPO3-Documentation/render-guides`
project is NOT SUPPORTED as a Composer package, making native
use impossible.

The Docker container provides a proxy server that returns (proxies) your rendered ReST
documentation (as HTML) to a browser. Any change you make to the ReST-files
will automatically trigger a reload of your browser window.

This allows you to have some kind of "WYSIWYG" display of your
documentation, without the need to manually reload browser windows or
render documentation time and again. It will all happen on demand.

ReST is very dependent on the used renderer and its capabilities, so you
cannot really have a WYSIWYG editor for ReST files. A tool like this is, what comes
closest to editing files and directly seeing the impact of it.

## General Usage

This project depends on the ability to execute Docker Containers on your host.

You can also use Podman, if you prefer. Replace the `docker` commands with
`podman` in that case.

You can use the provided Docker container within any project directory:

```
docker run --rm -it --pull always \
         -v "./Documentation:/project/Documentation" \
         -v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp" \
         -p 5173:5173 ghcr.io/garvinhicking/typo3-documentation-browsersync:latest
```

This starts a server to listen on localhost port 5173, so you can
point your browser to a URL like this:

```
http://localhost:5173/Documentation-GENERATED-temp/Index.html
```

### Output

The Docker container will show you the vite console of the running server,
you can interact with it. It will run until you enter `q` ("quit") or use `Ctrl-C`
to end the process.

Whenever you make changes to either the `.rst` or `.html` files, you will
see console output about what is performed.

### Demo project

There's a simple demo project which showcases how to use it with a dummy
Documentation directory

https://github.com/garvinhicking/demo-typo3-documentation-browsersync

### Parameters of the "docker run" command explained

The docker command above starts the Docker container
`ghcr.io/garvinhicking/typo3-documentation-browsersync:latest` with these
options:

* `--rm`: When Docker finishes, the container is stopped.
* `-it`: Runs an interactive shell, so that you can enter commands to the
  vite proxy server
* `--pull always`: Ensures that the referenced Docker image is always fetched
  in its current version.
* `-v "./Documentation:/project/Documentation"`: Makes the directory
  `Documentation` available ("mount") in the Docker container, so that `.rst`
  files can be accessed and watched.
* `-v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp"`:
  Makes the output directory `Documentation-GENERATED-temp` available ("mount")
  in the Docker container, so that `.html` files can be written and watched there.
* `-p 5173:5173`: This makes the proxy HTTP server that runs on port 5173 inside
  the Docker container available to your host, so that you can use your host's
  browser to view the rendered HTML output. If you want to have multiple ports
  running, you can pick any other number than `5173` as the *FIRST* part of this
  parameter, e.g. `-p 8080:5173`.
* `ghcr.io/garvinhicking/typo3-documentation-browsersync:latest`: This specifies
  the Docker container that is being run. The tag `:latest` is used so that you
  run the latest release version of the project. You can also specifically use
  a version like `:0.1`, which is not recommended though.

If you want to know what is contained inside the Docker container, please check out
the Dockerfile used to build it:

https://github.com/garvinhicking/typo3-documentation-browsersync/blob/main/Dockerfile

Once the Docker is up and running, it will watch the Directory `Documentation` for
any changes, trigger rendering and proxy the created HTML to your browser.

## Changing default port and directories

You can provide these environment variables, if you want to run
on non-default ports and different directories:

* LOCAL_RENDER_PORT=5173
* LOCAL_RENDER_INPUT=Documentation
* LOCAL_RENDER_OUTPUT=Documentation-GENERATED-temp

So a full docker run command utilizing this, and directly opening
a browser window with the URL, would look like:

```
LOCAL_RENDER_PORT=5175 \
LOCAL_RENDER_INPUT=Documentation \
LOCAL_RENDER_OUTPUT=Documentation-GENERATED-temp; \
\
open "http://localhost:${LOCAL_RENDER_PORT}/Documentation-GENERATED-temp/Index.html" && \
docker run --rm -it --pull always \
  -e LOCAL_RENDER_PORT=$LOCAL_RENDER_PORT \
  -e LOCAL_RENDER_INPUT=$LOCAL_RENDER_INPUT \
  -e LOCAL_RENDER_OUTPUT=$LOCAL_RENDER_OUTPUT \
  -v "$(pwd)/${LOCAL_RENDER_INPUT}:/project/Documentation" \
  -v "$(pwd)/${LOCAL_RENDER_OUTPUT}:/project/Documentation-GENERATED-temp" \
  -p "${LOCAL_RENDER_PORT}:5173" \
  ghcr.io/garvinhicking/typo3-documentation-browsersync:latest
```

See the file `alias.sh` in this repository, you could place these
lines into an alias of your Shell, or place it in a
`/usr/local/bin/render-wysiwyg.sh` file and call it.

The reason why the environment variables are called twice is because the
docker run command already needs to access them, and then they also need
to be propagated into the docker container as well.

## HEADS UP: WRITE-actions to files on the HOST-side!

*IMPORTANT*: The rendering process will *CHANGE AND OVERWRITE FILES* in the
output-directory (`Documentation-GENERATED-temp`). Be sure to only execute
the container if there are no files in there that may not be overwritten!

If the directory is empty, a first-time rendering will be started when the
Docker container is started.

If the input directory is missing, the watch server will fail.

The input directory (`Documentation`) is only used for reading.

## Building a local container

Via GitHub Actions, this project creates a Docker Container on ghcr.io via
a multi-stage build process.

The contained `Dockerfile` performs this:

* Use the `TYPO3-Documentation/render-guides` base Docker container
  (`:latest`)
* Put a NodeJS alpine environment on top
* Configures PHP (so the render-guides base can be used natively)
* Setup NPM and vite
* Define the entrypoint

If you check out this project, you can build the Docker container yourself:

```
docker build . -t typo3-documentation-browsersync:local
## or: make docker-build
```

and then execute it via:

```
docker run --rm -it --pull always \
         -v "./Documentation:/project/Documentation" \
         -v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp" \
         -p 5173:5173 typo3-documentation-browsersync:local

## or enter: make docker-enter
```

## Notes

A first idea was to also provide a native way (without Docker) to
perform rendering and proxying locally. The depedency chain for this
was harsh, and the `render-guides` project does not support being
used as a dependency.

So this is currently "beyond scope". The repository has a base
`composer.json` file and abilities to run locally, but this is
just a stub.

The only vital things inside this project are:

* `package.json`, `package-lock.json`: NPM dependencies
* `vite.config.js`: The actual "code"
* `Dockerfile`: The instructions to build the Docker Container
* `.dockerignore`: Excluded files for Docker Container
* `.nvmrc`: NVM version config
* `.github/workflows`: GitHub workflow definition to automatically provide Docker Containers to the world

## Alternatives (PHPStorm)

PHPStorm actually offers a cool way to create a local proxy server on its
own; when you pick a rendered HTML file and right-click `Open in > Browser >
Default` it will open a browser window on your host and show the contents
of the HTML file, and also have hot-reload capability. So when you change
anything in the HTML file, the PHPStorm proxy server will directly reload
your output, too. It will however NOT render the ReST files automatically,
when such a file is edited.

If your OS supports `inotifywait` (on Linux), you could use this:

```
inotifywait -e close_write,moved_to,create -m . |
while read -r directory events filename; do
  docker run --rm --pull always -v $(pwd):/project -it ghcr.io/typo3-documentation/render-guides:latest --config=Documentation
done
```

to automatically "watch" for any change on ReST files inside the
`Documentation` folder, then re-render the HTML, which would then
automatically reload your browser window.

Sadly, `inotifywait` is not available on `macOS` and the alternative to
build a custom `PHP pecl inotify` package-enabled tool was beyond my
personal scope, as well as using alternate tools like `fswatch`.

I wanted to have an easy way for anyone to preview changes, so I wanted to
not require PHPStorm or a specific inotify-enabled OS.

Instead, the `NodeJS` ecosystem provides a `browsersync` package that does
all of the needed watching and proxying. I coupled this with `vite`, because
alternatives like `gulp` or `grunt` are outdated and report many security
issues on their dependencies.
