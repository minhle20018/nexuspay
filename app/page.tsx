Get-Clipboard -Raw | Set-Content -Path "app\page.tsx" -Encoding utf8 -NoNewline
git status
git add .
git commit -m "Complete full page.tsx with wallet sync and sign-out"
git push origin main