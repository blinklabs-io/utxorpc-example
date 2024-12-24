#!/usr/bin/env bash

docker run --rm -ti \
	-v $(pwd -P):/code \
	-p${WEB_PORT:-5173}:5173 \
	--workdir /code \
	--user 1000 \
	--entrypoint bash \
	node:20
