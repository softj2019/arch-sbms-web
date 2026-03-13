$targets = Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -like "*gradlew.bat*bootRun*" -or
        $_.CommandLine -like "*org.gradle.launcher.GradleMain*bootRun*" -or
        $_.CommandLine -like "*com.archivsoft.sbms.Application*"
    }

if (-not $targets) {
    Write-Output "No dev server process found."
    exit 0
}

$targets | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Output ("Stopped process count=" + $targets.Count)
