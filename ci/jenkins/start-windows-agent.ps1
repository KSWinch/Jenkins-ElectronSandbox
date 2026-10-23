# Connects this Windows PC to the local Jenkins as the "windows-host" agent.
# Needs Java 17+ on PATH. Builds run as the current user with the current PATH,
# so Node 22.12+, CMake, Ninja and g++ must be available in this shell.
param(
  [string]$JenkinsUrl = 'http://localhost:8080',
  [string]$User = 'admin',
  [string]$Password = $env:JENKINS_ADMIN_PASSWORD,
  [string]$WorkDir = 'C:\jenkins-agent'
)
$ErrorActionPreference = 'Stop'

if (-not $Password) { $Password = Read-Host 'Jenkins admin password' }
# Builds launched from inside VS Code inherit this and would turn Electron into plain Node.
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Force $WorkDir | Out-Null
$jar = Join-Path $WorkDir 'agent.jar'
Invoke-WebRequest "$JenkinsUrl/jnlpJars/agent.jar" -OutFile $jar

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${User}:${Password}"))
$jnlp = [xml](Invoke-WebRequest "$JenkinsUrl/computer/windows-host/jenkins-agent.jnlp" `
  -Headers @{ Authorization = "Basic $auth" } -UseBasicParsing).Content
$secret = $jnlp.jnlp.'application-desc'.argument[0]

java -jar $jar -url $JenkinsUrl -secret $secret -name windows-host -workDir $WorkDir
