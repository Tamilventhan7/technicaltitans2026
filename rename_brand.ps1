$root = "c:\Users\prasa\OneDrive\Documents\PRASANNA\TranspitOps"
$extensions = @("*.tsx","*.ts","*.html","*.json","*.css","*.md")
$excludeDirs = @("node_modules",".git","dist",".next","build")

$files = Get-ChildItem -Path $root -Recurse -Include $extensions | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($path -match [regex]::Escape("\$dir\")) { $skip = $true; break }
    }
    -not $skip
}

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match "TransitOps") {
        $newContent = $content -replace "TransitOps\+", "TranspitOps" -replace "TransitOps", "TranspitOps"
        Set-Content $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($file.FullName)"
        $count++
    }
}

Write-Host ""
Write-Host "Done! Updated $count file(s)."
