# Test API endpoints for creating loads, vehicles, and routes

Write-Host "Testing Load Creation..." -ForegroundColor Yellow
$loadBody = @{
    origin = "Karachi"
    destination = "Lahore"
    cargoType = "Electronics"
    weight = 5000
    price = "2500"
    pickupDate = "2024-01-25"
    deliveryDate = "2024-01-28"
} | ConvertTo-Json

try {
    $loadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/loads" -Method Post -Body $loadBody -ContentType "application/json"
    Write-Host "✓ Load created successfully!" -ForegroundColor Green
    Write-Host $loadResponse | ConvertTo-Json
} catch {
    Write-Host "✗ Load creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Vehicle Creation..." -ForegroundColor Yellow
$vehicleBody = @{
    type = "20ft Container"
    registrationNumber = "TEST-123"
    capacity = "15000"
    currentLocation = "Karachi"
} | ConvertTo-Json

try {
    $vehicleResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/trucks" -Method Post -Body $vehicleBody -ContentType "application/json"
    Write-Host "✓ Vehicle created successfully!" -ForegroundColor Green
    Write-Host $vehicleResponse | ConvertTo-Json
} catch {
    Write-Host "✗ Vehicle creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Route Creation (Admin)..." -ForegroundColor Yellow
$routeBody = @{
    from = "Karachi"
    to = "Lahore"
    distance = 1200
    estimatedDays = "2-3 days"
} | ConvertTo-Json

try {
    $routeResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/routes" -Method Post -Body $routeBody -ContentType "application/json" -Headers @{Authorization="Bearer admin-token"}
    Write-Host "✓ Route created successfully!" -ForegroundColor Green
    Write-Host $routeResponse | ConvertTo-Json
} catch {
    Write-Host "✗ Route creation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest Complete!" -ForegroundColor Cyan
