# Local Jenkins controller for testing the PR pipeline. Not meant for production.
FROM jenkins/jenkins:lts-jdk21

# Docker CLI only; builds talk to the host's Docker engine through the mounted socket.
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml
ENV JAVA_OPTS=-Djenkins.install.runSetupWizard=false
