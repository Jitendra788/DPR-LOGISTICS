Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\public\dpr-logo.jpeg"
$outPath = Join-Path $PSScriptRoot "..\public\dpr-logo-header.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$minX = $src.Width; $minY = $src.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $src.Height; $y++) {
  for ($x = 0; $x -lt $src.Width; $x++) {
    $p = $src.GetPixel($x, $y)
    if ($p.A -gt 10 -and ($p.R -lt 245 -or $p.G -lt 245 -or $p.B -lt 245)) {
      if ($x -lt $minX) { $minX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$pad = 6
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($src.Width - 1, $maxX + $pad)
$maxY = [Math]::Min($src.Height - 1, $maxY + $pad)
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved $outPath (${w}x${h})"
$src.Dispose(); $bmp.Dispose(); $g.Dispose()
