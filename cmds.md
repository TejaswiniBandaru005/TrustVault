Terminal 1: Run the Spring Boot Backend (Port 8080)

In your VS Code terminal (PowerShell):

powershell

cd D:\TrustVault\trustvault-backend

Get-Content ..\.env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') } }

.\mvnw.cmd spring-boot:run

Backend URL: http://localhost:8080




Terminal 2: Run the Vite React Frontend (Port 5173)

powershell

cd D:\TrustVault\frontend

npm run dev

Frontend URL: http://localhost:5173