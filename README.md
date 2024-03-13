# typo3-documentation-browsersync


## Introduction

Standalone project (NodeJS, browsersync) to render and hot-reload changes 
in ReST documentation to your browser window.

This project exists to be build as a Docker container. It's not meant
to be run natively.

The Docker container provides a proxy server that returns (proxies) your rendered ReST
documentation (as HTML) to a browser. Any change you make to the ReST-files
will automatically trigger a reload of your browser window.

This allows you to have some kind of "WYSIWYG" display of your
documentation, without the need to manually reload browser windows or
render documentation time and again. It will all happen on demand.

ReST is very dependant on the used renderer and its capabilities, so you
cannot really have a WYSIWYG editor for ReST files. So this is what comes
closest to editing files and directly seeing the impact of it.

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

## General Usage

(WORK IN PROGRESS)

This project depends on the ability to execute Docker Containers on your host.

You can also use Podman, if you prefer. Replace the `docker` commands with
`podman` in that case.

Via GitHub Actions, this project creates a Docker Container on ghcr.io via
a multi-stage build process.

The contained `Dockerfile` performs this:

* Use the `TYPO3-Documentation/render-guides` base Docker container
  (`:latest`)
* Puts a NodeJS alpine environment on top
* Configures PHP (so the render-guides base can be used)
* Setup NPM and vite

You can use the provided Docker container easily in any project:

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


There's a simple demo project which showcases how to use it:

https://github.com/garvinhicking/demo-typo3-documentation-browsersync

## Building a local container

If you check out this project, you can build the Docker container yourself:

```
docker build . -t typo3-documentation-browsersync:local
```

and then execute it via:

```
docker run --rm -it --pull always \
         -v "./Documentation:/project/Documentation" \
         -v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp" \
         -p 5173:5173 typo3-documentation-browsersync:local

```

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
