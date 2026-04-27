# Opens inbound TCP 5280 so iPhone / other devices on your LAN can reach the Vite dev server.
# Run once from an elevated PowerShell (Right-click PowerShell -> Run as administrator), then:
#   cd path\to\news-kothari\web
#   .\scripts\allow-vite-firewall.ps1

#Requires -RunAsAdministrator

$DisplayName = "news-kothari Vite dev 5280"
$Port = 5280

$existing = Get-NetFirewallRule -DisplayName $DisplayName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule '$DisplayName' already exists. Nothing to do."
  exit 0
}

New-NetFirewallRule `
  -DisplayName $DisplayName `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort $Port `
  -Profile Private, Domain | Out-Null

Write-Host "Added inbound allow rule for TCP port $Port (Private + Domain profiles)."
Write-Host "On your iPhone use http://<Wi-Fi IPv4>:$Port — see README (iPhone / Safari section)."
