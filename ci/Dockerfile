# Build environment for the Linux stage of the Jenkinsfile.
# Also usable locally: docker build -t cpp-testbed-ci ci && docker run --rm -v "$PWD:/src" -w /src cpp-testbed-ci sh -c "npm ci && npm run dist -- --linux"
FROM node:22-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends cmake ninja-build g++ \
 && rm -rf /var/lib/apt/lists/*
