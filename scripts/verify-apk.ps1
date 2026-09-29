# Verifiko qe APK-ja e ndertuar permban JS bundle-in (offline, pa Metro)
# perdor:  powershell -File scripts\verify-apk.ps1

$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }

$found = @(@(
  (Join-Path $root 'android\app\build\outputs\apk\debug\app-debug.apk'),
  (Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk')
) | Where-Object { Test-Path $_ } | Sort-Object { (Get-Item $_).LastWriteTime } -Descending)

if ($found.Count -eq 0) {
  Write-Host "NUK KA APK - nderto fillimisht me:  npm run build:apk:debug" -ForegroundColor Red
  exit 1
}
$Apk = $found[0]

Write-Host "APK: $Apk"
$info = Get-Item $Apk
Write-Host ("Data: {0}   Madhesia: {1:N1} MB" -f $info.LastWriteTime, ($info.Length / 1MB))

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($Apk)
try {
  $bundle = $zip.Entries | Where-Object { $_.FullName -eq 'assets/index.android.bundle' }
  if (-not $bundle) {
    Write-Host "REZULTAT: DESHTUAR - APK-ja NUK permban assets/index.android.bundle" -ForegroundColor Red
    Write-Host "  -> nderto me 'npm run build:apk:debug' ose 'npm run build:android'" -ForegroundColor Yellow
    exit 2
  }
  $mb = [math]::Round($bundle.Length / 1MB, 2)
  Write-Host "Bundle: assets/index.android.bundle  ($mb MB)" -ForegroundColor Green
  if ($bundle.Length -lt 500000) { Write-Host "  KUJDESHTO: bundle-i duket i vogël - build-i ndoshta dështoi" -ForegroundColor Yellow }
  Write-Host "REZULTAT: OK - APK-ja punon OFFLINE (pa Metro, pa dev server)" -ForegroundColor Green
  Write-Host "Instalo me:  adb install -r `"$Apk`""
} finally { $zip.Dispose() }
