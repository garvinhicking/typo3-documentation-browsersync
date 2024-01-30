# typo3-documentation-browsersync

## Introduction

Standalone project (NodeJS, browsersync) to render and hot-reload changes 
in ReST documentation to your browser window.

This project provides a proxy server that returns your rendered ReST
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

The repository https://github.com/garvinhicking/typo3-documentation-browsersync
allows for multiple ways to be used.

This project depends on the ability to execute Docker Images on your host.

The easiest way to use this is via the ready-to-use Docker Image.

You can:
 
   * The project itself is built as a ready-to-use Docker Image, so you
     don't need to install it at all on your host. Context is specified
     via arguments to the Docker command. This is the recommended and
     easiest way of usage.

   * Include it as a `dev-dependency` composer package to any of your TYPO3 
     documentation or extension projects, so the context can be autodetected.

   * You can globally require the composer package to be able to use
     it anyhwere. You will then need to specify context (directories) to
     its execution.

For the last two options, you need to be able to either locally run
NodeJS and npm, or to build your own Docker Image via this repository.

### Usage via Docker (recommended)

### Usage via `dev-dependency`

### Usage via global dependency

## TODO

docker build . -t typo3-documentation-browsersync:local -f Dockerfile-renderguides


All of it.