#!/bin/bash

docker run --rm --name meteor -v ${PWD}:/app -v /tmp:/build local/c7-meteor meteor build /build --architecture os.linux.x86_64
