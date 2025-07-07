# EduScope User Setup Script
# This script creates three default users with different roles for testing

Write-Host "Setting up EduScope default users..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Docker containers are running
Write-Host "Checking if containers are running..." -ForegroundColor Yellow
$containers = docker ps --filter "name=eduscope" --format "table {{.Names}}"

if ($containers -match "eduscope") {
    Write-Host "Docker containers are running" -ForegroundColor Green
} else {
    Write-Host "EduScope containers are not running. Please start them first with 'docker compose up -d'" -ForegroundColor Red
    exit 1
}

# Wait for MongoDB to be ready
Write-Host "Waiting for MongoDB to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run the user setup script inside the web container
Write-Host "Creating default users..." -ForegroundColor Yellow

try {
    docker exec eduscope-web-1 node /app/scripts/setup-users.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Default users created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now login with:" -ForegroundColor Cyan
        Write-Host "  Student: student`@students.nsbm.ac.lk (Password: Test`@123)" -ForegroundColor White
        Write-Host "  Moderator: moderator`@nsbm.ac.lk (Password: Test`@123)" -ForegroundColor White
        Write-Host "  Admin: admin`@nsbm.ac.lk (Password: Test`@123)" -ForegroundColor White
        Write-Host ""
        Write-Host "Note:" -ForegroundColor Yellow
        Write-Host "  - Students use `@students.nsbm.ac.lk domain" -ForegroundColor Gray
        Write-Host "  - Staff (moderators/admins) use `@nsbm.ac.lk domain" -ForegroundColor Gray
    } else {
        Write-Host "Failed to create users. Check the output above for details." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error running user setup script: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
