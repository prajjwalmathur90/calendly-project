$ErrorActionPreference = 'Stop'
$baseUrl = "http://localhost:3001"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== HEALTH CHECK ==="
Invoke-RestMethod -Uri "$baseUrl/health" -Method Get | ConvertTo-Json -Depth 5
Write-Host "`n"

Write-Host "=== GET ALL USERS ==="
$usersRes = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get
$usersRes | ConvertTo-Json -Depth 5
Write-Host "`n"

$userId = $usersRes.data[0].id
$userSlug = $usersRes.data[0].slug

if (-not $userId) {
    Write-Host "No user found in DB. Please ensure a user exists."
    exit
}
Write-Host "Using User ID: $userId and Slug: $userSlug for further tests.`n"

$authHeaders = @{ "Content-Type" = "application/json"; "x-user-id" = "$userId" }

Write-Host "=== CREATE EVENT ==="
$eventBody = @{
    title = "Test Event"
    description = "Testing events"
    durationMinutes = 30
    locationType = "Google Meet"
    slug = "test-event-slug-123"
} | ConvertTo-Json

try {
    $createEventRes = Invoke-RestMethod -Uri "$baseUrl/events/new" -Method Post -Headers $authHeaders -Body $eventBody
    $createEventRes | ConvertTo-Json -Depth 5
    $eventId = $createEventRes.data.id
} catch {
    Write-Host "Failed to create event: $_"
}
Write-Host "`n"

if ($eventId) {
    Write-Host "=== GET EVENT BY ID ==="
    Invoke-RestMethod -Uri "$baseUrl/events/$eventId" -Method Get -Headers $authHeaders | ConvertTo-Json -Depth 5
    Write-Host "`n"

    Write-Host "=== GET PUBLIC EVENT ==="
    $eventSlug = $createEventRes.data.slug
    try {
        Invoke-RestMethod -Uri "$baseUrl/public/users/$userId/events/$eventSlug" -Method Get | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "Failed GET PUBLIC EVENT: $_"
    }
    Write-Host "`n"

    Write-Host "=== DELETE EVENT ==="
    Invoke-RestMethod -Uri "$baseUrl/events/$eventId" -Method Delete -Headers $authHeaders | ConvertTo-Json -Depth 5
    Write-Host "`n"
}

Write-Host "=== CREATE AVAILABILITY RULE ==="
$ruleBody = @{
    weekday = 1
    startTime = "09:00"
    endTime = "17:00"
    isActive = $true
    timezone = "UTC"
} | ConvertTo-Json

try {
    $createRuleRes = Invoke-RestMethod -Uri "$baseUrl/availability/rules/new" -Method Post -Headers $authHeaders -Body $ruleBody
    $createRuleRes | ConvertTo-Json -Depth 5
    $ruleId = $createRuleRes.data.id
} catch {
    Write-Host "Failed to create rule: $_"
}
Write-Host "`n"

if ($ruleId) {
    Write-Host "=== GET ALL AVAILABILITY RULES ==="
    Invoke-RestMethod -Uri "$baseUrl/availability/rules" -Method Get -Headers $authHeaders | ConvertTo-Json -Depth 5
    Write-Host "`n"

    Write-Host "=== DELETE AVAILABILITY RULE ==="
    Invoke-RestMethod -Uri "$baseUrl/availability/rules/$ruleId" -Method Delete -Headers $authHeaders | ConvertTo-Json -Depth 5
    Write-Host "`n"
}

Write-Host "=== FINISHED ==="
