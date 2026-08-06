# Nebula Drift - zero-dependency local static server
param([int]$Port = 8080)

$root = $PSScriptRoot
$url = "http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".json" = "application/json"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
  ".md"   = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
} catch {
  Write-Host "Could not bind $url - is port $Port already in use?"
  exit 1
}

Write-Host "Nebula Drift running at $url"
Write-Host "Press Ctrl+C to stop."
Start-Process $url

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  $path = [Uri]::UnescapeDataString($req.Url.LocalPath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }

  $full = Join-Path $root ($path -replace "/", [IO.Path]::DirectorySeparatorChar)

  if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
    $res.StatusCode = 404
    $msg = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
    $res.ContentLength64 = $msg.Length
    $res.OutputStream.Write($msg, 0, $msg.Length)
    $res.Close()
    continue
  }

  $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
  if ($mime.ContainsKey($ext)) {
    $res.ContentType = $mime[$ext]
  } else {
    $res.ContentType = "application/octet-stream"
  }

  $bytes = [IO.File]::ReadAllBytes($full)
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.Close()
}
