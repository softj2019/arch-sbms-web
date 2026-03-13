$projectRoot = Split-Path -Parent $PSScriptRoot
$runnerScript = Join-Path $PSScriptRoot "run-dev-bootrun.ps1"

$existing = Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -like "*gradlew.bat*bootRun*" -or
        $_.CommandLine -like "*org.gradle.launcher.GradleMain*bootRun*" -or
        $_.CommandLine -like "*com.archivsoft.sbms.Application*"
    }

if ($existing) {
    $existing | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

$process = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $runnerScript `
    -WindowStyle Hidden `
    -PassThru

Write-Output ("Started hidden dev server wrapper PID=" + $process.Id)
