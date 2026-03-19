# Run Both Frontend, Backend, and Internalization Servers

Write-Host "🚀 Starting BearTron Platform..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in a new window
Write-Host "📡 Starting Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '=== BACKEND SERVER ===' -ForegroundColor Green; Write-Host 'Port: 5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Start Internalization in a new window
Write-Host "🔄 Starting Internalization Platform (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Internalisation'; Write-Host '=== INTERNALIZATION SERVER ===' -ForegroundColor Magenta; Write-Host 'Port: 4000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Wait for servers to start
Start-Sleep -Seconds 2

# Start Frontend in a new window
Write-Host "🎨 Starting Frontend App (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== FRONTEND SERVER ===' -ForegroundColor Blue; Write-Host 'Port: 3000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ All servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API:      http://localhost:5000" -ForegroundColor Yellow
Write-Host "🔄 Internalization:  http://localhost:4000" -ForegroundColor Magenta
Write-Host "🎨 Frontend App:     http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "📝 Check the server windows for logs and errors" -ForegroundColor Gray
Write-Host ""
Write-Host "Closing this launcher in 5 seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5
