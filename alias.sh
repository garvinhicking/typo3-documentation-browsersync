#!/bin/bash

## You could alias this command, this shows how to use
## environment variables to define commands, which are also
## directly part of the docker run command (i.e. the host-port)
##
## Where to run the local webserver on your HOST (container=5173):
## LOCAL_RENDER_PORT=5173
##
## Which directory to render, relative to current (container=Documentation)
## LOCAL_RENDER_INPUT=Documentation
##
## Where to store files on your HOST (container="Documentation-GENERATED-temp")
## LOCAL_RENDER_OUTPUT=Documentation-GENERATED-temp

LOCAL_RENDER_PORT=5175 LOCAL_RENDER_INPUT=Documentation LOCAL_RENDER_OUTPUT=Documentation-GENERATED-temp; \
open "http://localhost:${LOCAL_RENDER_PORT}/Documentation-GENERATED-temp/Index.html" && \
docker run --rm -it --pull always -v "$(pwd)/${LOCAL_RENDER_INPUT}:/project/Documentation" -v "$(pwd)/${LOCAL_RENDER_OUTPUT}:/project/Documentation-GENERATED-temp" -p "${LOCAL_RENDER_PORT}:5173" ghcr.io/garvinhicking/typo3-documentation-browsersync:latest
