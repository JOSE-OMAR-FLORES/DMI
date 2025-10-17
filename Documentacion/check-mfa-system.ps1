# 🔍 Script de Verificación Rápida - MFA System Check

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MFA SYSTEM VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\oimvf\Desktop\Proyecto DMI"
$backendPath = "$projectRoot\BackEndApp"
$frontendPath = "$projectRoot\FrontEndApp"

# Función para verificar archivo
function Check-File {
    param($path, $name)
    if (Test-Path $path) {
        Write-Host "✅ $name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $name NOT FOUND" -ForegroundColor Red
        return $false
    }
}

# Verificar Backend Files
Write-Host "BACKEND FILES:" -ForegroundColor Yellow
Check-File "$backendPath\app\Services\LaravelMFAService.php" "LaravelMFAService.php"
Check-File "$backendPath\app\Http\Controllers\AuthMFAController.php" "AuthMFAController.php"
Check-File "$backendPath\app\Mail\MFACodeMail.php" "MFACodeMail.php"
Check-File "$backendPath\resources\views\emails\mfa-code.blade.php" "mfa-code.blade.php"
Write-Host ""

# Verificar Frontend Files
Write-Host "FRONTEND FILES:" -ForegroundColor Yellow
Check-File "$frontendPath\src\services\mfaService.js" "mfaService.js"
Check-File "$frontendPath\src\screens\MFAVerificationScreen.js" "MFAVerificationScreen.js"
Check-File "$frontendPath\src\screens\MFASettingsScreen.js" "MFASettingsScreen.js"
Write-Host ""

# Verificar Documentación
Write-Host "DOCUMENTATION:" -ForegroundColor Yellow
Check-File "$projectRoot\MFA_IMPLEMENTATION_GUIDE.md" "Implementation Guide"
Check-File "$projectRoot\TESTING_COMMANDS.md" "Testing Commands"
Check-File "$projectRoot\MFA_VISUAL_FLOW.md" "Visual Flow"
Check-File "$projectRoot\MFA_COMPLETED.md" "Completion Summary"
Check-File "$projectRoot\FINAL_CHECKLIST.md" "Final Checklist"
Check-File "$projectRoot\README_MFA.md" "README MFA"
Write-Host ""

# Verificar .env
Write-Host "CONFIGURATION:" -ForegroundColor Yellow
$envPath = "$backendPath\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "MAIL_HOST=sandbox.smtp.mailtrap.io") {
        Write-Host "✅ Mailtrap configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Mailtrap NOT configured" -ForegroundColor Yellow
    }
    
    if ($envContent -match "MAIL_USERNAME=8c44bd0f43776f") {
        Write-Host "✅ Mailtrap username set" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Mailtrap username NOT set" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Verificar IP en mfaService.js
Write-Host "NETWORK CONFIG:" -ForegroundColor Yellow
$mfaServicePath = "$frontendPath\src\services\mfaService.js"
if (Test-Path $mfaServicePath) {
    $mfaServiceContent = Get-Content $mfaServicePath -Raw
    
    if ($mfaServiceContent -match "http://(\d+\.\d+\.\d+\.\d+):8000") {
        $ip = $Matches[1]
        Write-Host "✅ IP configured: $ip" -ForegroundColor Green
        
        # Obtener IP actual
        $currentIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
        
        if ($ip -eq $currentIP) {
            Write-Host "✅ IP matches current IP" -ForegroundColor Green
        } else {
            Write-Host "⚠️  IP mismatch. Current IP: $currentIP" -ForegroundColor Yellow
            Write-Host "   Update mfaService.js line 9 with: http://${currentIP}:8000/api/v1" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  IP not found in mfaService.js" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ mfaService.js NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Verificar node_modules
Write-Host "DEPENDENCIES:" -ForegroundColor Yellow
if (Test-Path "$frontendPath\node_modules\@react-native-clipboard\clipboard") {
    Write-Host "✅ Clipboard package installed" -ForegroundColor Green
} else {
    Write-Host "❌ Clipboard package NOT installed" -ForegroundColor Red
    Write-Host "   Run: npm install @react-native-clipboard/clipboard" -ForegroundColor Yellow
}
Write-Host ""

# Verificar procesos corriendo
Write-Host "SERVICES STATUS:" -ForegroundColor Yellow
$phpProcess = Get-Process -Name php -ErrorAction SilentlyContinue
if ($phpProcess) {
    Write-Host "✅ PHP/Laravel is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PHP/Laravel is NOT running" -ForegroundColor Yellow
    Write-Host "   Run: cd BackEndApp; php artisan serve" -ForegroundColor Yellow
}

$nodeProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcess) {
    Write-Host "✅ Node/Expo is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node/Expo is NOT running" -ForegroundColor Yellow
    Write-Host "   Run: cd FrontEndApp; npm start" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Verificar archivos críticos
$criticalFiles = @(
    "$backendPath\app\Services\LaravelMFAService.php",
    "$frontendPath\src\services\mfaService.js",
    "$frontendPath\src\screens\MFAVerificationScreen.js",
    "$frontendPath\src\screens\MFASettingsScreen.js"
)

foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        $allGood = $false
        break
    }
}

if ($allGood) {
    Write-Host "✅ MFA System: READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Update IP in mfaService.js if needed" -ForegroundColor White
    Write-Host "2. Start backend: cd BackEndApp; php artisan serve" -ForegroundColor White
    Write-Host "3. Start frontend: cd FrontEndApp; npm start" -ForegroundColor White
    Write-Host "4. Follow FINAL_CHECKLIST.md for testing" -ForegroundColor White
} else {
    Write-Host "❌ MFA System: INCOMPLETE" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
