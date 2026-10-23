// Runs on every branch and PR discovered by a Multibranch Pipeline job.
// Each platform builds the C++ backend, runs its tests, then packages a
// no-install artifact (portable .exe / AppImage) that devs can grab from the build page.
pipeline {
  agent none

  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    // A new push to the same PR aborts the older, now-stale build.
    disableConcurrentBuilds(abortPrevious: true)
  }

  stages {
    stage('Build') {
      parallel {
        stage('Windows') {
          // Agent needs: Node 22.12+, CMake, Ninja, and a C++ compiler (MinGW g++ or MSVC) on PATH.
          agent { label 'windows' }
          environment {
            ELECTRON_CACHE = "${WORKSPACE}\\.cache\\electron"
            ELECTRON_BUILDER_CACHE = "${WORKSPACE}\\.cache\\electron-builder"
          }
          steps {
            bat 'npm ci'
            bat 'npm run build:backend'
            bat 'npm test'
            bat 'npm run package -- --win'
          }
          post {
            success {
              archiveArtifacts artifacts: 'dist/*.exe', fingerprint: true
              script {
                // Optional: agents with DROP_DIR set also get a copy in a local folder.
                if (env.DROP_DIR?.trim()) {
                  def dest = "${env.DROP_DIR}\\${env.JOB_NAME.replace('/', '_')}-${env.BUILD_NUMBER}"
                  powershell "New-Item -ItemType Directory -Force '${dest}' | Out-Null; Copy-Item dist\\*.exe '${dest}'"
                  echo "Copied build to ${dest}"
                }
              }
            }
          }
        }

        stage('Linux') {
          // Builds inside ci/Dockerfile so the agent only needs Docker.
          agent {
            dockerfile {
              filename 'ci/Dockerfile'
              label 'docker'
            }
          }
          environment {
            // The container runs as the Jenkins user, which has no writable home.
            HOME = "${WORKSPACE}"
            ELECTRON_CACHE = "${WORKSPACE}/.cache/electron"
            ELECTRON_BUILDER_CACHE = "${WORKSPACE}/.cache/electron-builder"
          }
          steps {
            sh 'npm ci'
            sh 'npm run build:backend'
            sh 'npm test'
            sh 'npm run package -- --linux'
          }
          post {
            success {
              archiveArtifacts artifacts: 'dist/*.AppImage', fingerprint: true
            }
          }
        }
      }
    }
  }
}
