$projectRoot = Split-Path -Parent $PSScriptRoot
$javaHome = "D:\java\jdk-17.0.18+8"
$stdoutLog = Join-Path $projectRoot "logs\bootrun-dev.out.log"
$stderrLog = Join-Path $projectRoot "logs\bootrun-dev.err.log"

New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot "logs") | Out-Null

$env:JAVA_HOME = $javaHome
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Set-Location $projectRoot
& .\gradlew.bat bootRun --args="--spring.profiles.active=dev" 1>> $stdoutLog 2>> $stderrLog
