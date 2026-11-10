$ErrorActionPreference = 'Stop'
$source = (Resolve-Path $PSScriptRoot).Path.TrimEnd('\\')
$destination = 'C:\Users\DELL\Downloads\careerportal'

if ($source -ieq $destination.TrimEnd('\\')) {
  Write-Host "Project is already in the requested folder: $destination" -ForegroundColor Green
  exit 0
}

New-Item -ItemType Directory -Force -Path $destination | Out-Null
Write-Host "Copying CareerConnect source files to $destination ..." -ForegroundColor Cyan

& robocopy $source $destination /E /R:2 /W:1 /XD node_modules .next .expo dist .git /XF *.log
$robocopyCode = $LASTEXITCODE
if ($robocopyCode -ge 8) {
  throw "Robocopy failed with exit code $robocopyCode."
}

Write-Host "Source files copied successfully." -ForegroundColor Green
Write-Host "Next: open PowerShell in $destination and run: npm install" -ForegroundColor Yellow
