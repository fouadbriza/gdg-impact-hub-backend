# setup-tests.ps1

# Configuration
$baseUrl = "http://localhost:3000"
$testEmail = "test.mentor@example.com"
$testPassword = "TestPass123!"
$testName = "Test Mentor"
$testRole = "MENTOR"

# Global variables to store tokens and IDs
$global:authToken = $null
$global:mentorId = $null
$global:projectId = $null
$global:mentorshipRequestId = $null
$global:sessionId = $null

# Helper function to make API requests
function Invoke-ApiRequest {
    param (
        [string]$url,
        [string]$method = "GET",
        [object]$body = $null,
        [string]$token = $global:authToken,
        [switch]$skipAuth = $false
    )

    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($token -and -not $skipAuth) {
        $headers["Authorization"] = "Bearer $token"
    }

    $params = @{
        Uri = $url
        Method = $method
        Headers = $headers
    }

    if ($body) {
        $params.Body = $body | ConvertTo-Json -Depth 10
    }

    try {
        $response = Invoke-WebRequest @params -UseBasicParsing
        $responseObj = $response.Content | ConvertFrom-Json
        return @{
            StatusCode = $response.StatusCode
            Data = $responseObj
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMessage = $errorDetails.message
        } catch {}
        return @{
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $errorMessage
        }
    }
}

# Test function with output
function Test-Endpoint {
    param (
        [string]$name,
        [scriptblock]$testScript
    )

    Write-Host "`n=== Testing $name ===" -ForegroundColor Cyan
    $result = & $testScript
    
    if ($result.StatusCode -ge 200 -and $result.StatusCode -lt 300) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        if ($result.Data) {
            Write-Host "Response: " -NoNewline
            $result.Data | ConvertTo-Json -Depth 3
        }
        return $true
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
        Write-Host "Status: $($result.StatusCode)"
        if ($result.Error) {
            Write-Host "Error: $($result.Error)" -ForegroundColor Red
        }
        return $false
    }
}

# 1. Start the server
Write-Host "`n🚀 Starting server..." -ForegroundColor Yellow
$serverProcess = Start-Process -NoNewWindow -PassThru -FilePath "node" -ArgumentList "src/server.js"

# Wait for server to start
Start-Sleep -Seconds 5

# 2. Register a test mentor
$registerSuccess = Test-Endpoint "Register Test User" {
    $body = @{
        name = $testName
        email = $testEmail
        password = $testPassword
        role = $testRole
    }
    $result = Invoke-ApiRequest -url "$baseUrl/api/auth/register" -method "POST" -body $body -skipAuth
    if ($result.Data -and $result.Data.token) {
        $global:authToken = $result.Data.token
        $global:mentorId = $result.Data.user.id
    }
    return $result
}

if (-not $registerSuccess) {
    Write-Host "Failed to register test user. Trying to login instead..." -ForegroundColor Yellow
    
    # First, try to register again with a different email
    $testEmail = "test.mentor2@example.com"
    $registerSuccess = Test-Endpoint "Register Alternative Test User" {
        $body = @{
            name = "Alternative Test Mentor"
            email = $testEmail
            password = $testPassword
            role = $testRole
        }
        $result = Invoke-ApiRequest -url "$baseUrl/api/auth/register" -method "POST" -body $body -skipAuth
        if ($result.Data -and $result.Data.token) {
            $global:authToken = $result.Data.token
            $global:mentorId = $result.Data.user.id
        }
        return $result
    }
    
    if (-not $registerSuccess) {
        # If register still fails, try to login with the original email
        $testEmail = "test.mentor@example.com"
        $loginSuccess = Test-Endpoint "Login Test User" {
            $body = @{
                email = $testEmail
                password = $testPassword
            }
            $result = Invoke-ApiRequest -url "$baseUrl/api/auth/login" -method "POST" -body $body -skipAuth
            if ($result.Data -and $result.Data.token) {
                $global:authToken = $result.Data.token
                $global:mentorId = $result.Data.user.id
            }
            return $result
        }
        
        if (-not $loginSuccess) {
            Write-Host "❌ Failed to authenticate. Please check your server and try again." -ForegroundColor Red
            Stop-Process -Id $serverProcess.Id -Force
            exit 1
        }
    }
}

# 3. Create a test project
$projectSuccess = Test-Endpoint "Create Test Project" {
    $body = @{
        title = "Test Mentorship Project"
        description = "This is a test project for mentorship"
        status = "ACTIVE"
    }
    $result = Invoke-ApiRequest -url "$baseUrl/api/projects" -method "POST" -body $body
    if ($result.Data -and $result.Data.id) {
        $global:projectId = $result.Data.id
    }
    return $result
}

# 4. Test Mentorship Requests
Test-Endpoint "List Mentorship Requests" {
    Invoke-ApiRequest -url "$baseUrl/api/mentorship/requests" -method "GET"
}

# 5. Test Sessions
$sessionSuccess = Test-Endpoint "Create Session" {
    $body = @{
        mentorshipRequestId = "test-request-id" # This would normally come from a request
        projectId = $global:projectId
        scheduledAt = (Get-Date).AddDays(1).ToString("o")
        durationMinutes = 60
        mode = "ONLINE"
        location = "https://meet.google.com/test-session"
    }
    $result = Invoke-ApiRequest -url "$baseUrl/api/mentorship/sessions" -method "POST" -body $body
    if ($result.Data -and $result.Data.id) {
        $global:sessionId = $result.Data.id
    }
    return $result
}

if ($global:sessionId) {
    Test-Endpoint "List Sessions" {
        Invoke-ApiRequest -url "$baseUrl/api/mentorship/sessions" -method "GET"
    }

    Test-Endpoint "Get Session by ID" {
        Invoke-ApiRequest -url "$baseUrl/api/mentorship/sessions/$global:sessionId" -method "GET"
    }

    # 6. Test Feedback
    Test-Endpoint "Submit Feedback" {
        $body = @{
            rating = 5
            comment = "Great session!"
        }
        Invoke-ApiRequest -url "$baseUrl/api/mentorship/sessions/$global:sessionId/feedback" -method "POST" -body $body
    }

    Test-Endpoint "Get Feedback" {
        Invoke-ApiRequest -url "$baseUrl/api/mentorship/sessions/$global:sessionId/feedback" -method "GET"
    }
}

# 7. Test Profile
Test-Endpoint "Get Profile" {
    Invoke-ApiRequest -url "$baseUrl/api/mentorship/profile" -method "GET"
}

Write-Host "`n✅ All tests completed!" -ForegroundColor Green

# Cleanup
Write-Host "`n🛑 Stopping server..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force
```__