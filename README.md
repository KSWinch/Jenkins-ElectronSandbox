# Electron + C++ Testbed

A minimal Electron app with a C++ backend. It exists to test CI: Jenkins builds every PR and
produces artifacts that run without being installed.

## How it fits together

```
renderer (HTML/JS) --ipc--> main.js --stdin/stdout--> backend.exe (C++)
```

- `backend/`: a standalone C++ executable (CMake). It reads `<id> <command> [args]` lines on
  stdin and writes one JSON response per line. The runtime is linked statically, so it needs
  no MinGW or VC++ DLLs.
- `src/main.js`: spawns the backend and forwards requests from the renderer.
- `src/backend.js`: the stdin/stdout client. It has no Electron dependency, so the smoke test
  reuses it.

Backend commands: `ping`, `version`, `sysinfo`, `add <n> <n> ...`, `echo <text>`.

## Prerequisites

Node 22.12+, CMake 3.16+, Ninja, and a C++17 compiler (MinGW g++ or MSVC on Windows, g++ on Linux).

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install dependencies |
| `npm start` | Build the backend and launch the app |
| `npm test` | Run the C++ unit tests (ctest) and the backend smoke test |
| `npm run dist` | Build, test, and package for the current OS into `dist/` |

## Artifacts (no install needed)

- **Windows**: `dist/CppTestbed-<version>-portable.exe`. It's a single exe that unpacks itself
  to a temp folder on each launch.
- **Linux**: `dist/CppTestbed-<version>-x86_64.AppImage`. Run `chmod +x` on it, then run it.

## Jenkins setup

1. Create a **Multibranch Pipeline** job pointing at this repo, using the GitHub (or
   Bitbucket/GitLab) branch source.
2. Under *Behaviours*, enable **Discover pull requests from origin** (and from forks if
   needed). Every PR then gets its own job that runs on each push.
3. Set up a webhook from the Git host to Jenkins so pushes trigger builds right away.
4. Agents:
   - `windows`: Node, CMake, Ninja, and a C++ compiler on PATH.
   - `docker`: any Linux agent with Docker. The build image comes from `ci/Dockerfile`.
5. A dev downloads the `.exe` / `.AppImage` from **Build Artifacts** on the PR's build page.

If you only have one kind of agent, delete the other stage in the `Jenkinsfile`.

### Local Jenkins for trying it out

`ci/jenkins/` runs a throwaway Jenkins in Docker. It comes preconfigured with the PR job,
the GitHub credential, and a `windows-host` agent slot.

1. Copy `ci/jenkins/.env.example` to `ci/jenkins/.env` and fill it in (it's git-ignored).
2. `docker compose -f ci/jenkins/docker-compose.yml up -d --build`, then open http://localhost:8080.
3. To run the Windows stage, connect this PC as the agent:
   `powershell -File ci/jenkins/start-windows-agent.ps1`. This needs Java 17+, plus Node 22.12+,
   CMake, Ninja and g++ on PATH.

A local Jenkins can't receive GitHub webhooks, so the job checks GitHub every minute instead.
Pass/fail shows up as a status check on the PR.
