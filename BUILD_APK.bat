@echo off
chcp 65001 >nul
title Build BloodNet APK

echo ============================================
echo   BUILD BLOODNET APK FOR ANDROID
echo ============================================
echo.

set "PROJECT_DIR=%~dp0"

:: Check for Android Studio bundled JDK first
if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo [FOUND] Using Android Studio bundled JDK
    goto build
)

if exist "C:\Program Files\Android\Android Studio\jre" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    echo [FOUND] Using Android Studio bundled JRE
    goto build
)

:: Check common JDK locations
if exist "C:\Program Files\Java\jdk-17" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    echo [FOUND] Using JDK 17
    goto build
)

if exist "C:\Program Files\Eclipse Adoptium\jdk-17*" (
    for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
        set "JAVA_HOME=%%D"
        echo [FOUND] Using Eclipse Temurin JDK 17
        goto build
)
)

echo [ERROR] No compatible JDK found!
echo.
echo Please install Java 17:
echo https://www.oracle.com/java/technologies/downloads/#java17
echo.
echo Or use Android Studio's built-in JDK by installing Android Studio.
echo.
pause
exit /b 1

:build
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo [INFO] JAVA_HOME: %JAVA_HOME%
echo.

cd /d "%PROJECT_DIR%mobile\android"

echo [BUILDING] Cleaning previous build...
call .\gradlew clean

echo.
echo [BUILDING] Assembling Release APK...
echo This may take 5-10 minutes on first run...
echo.
call .\gradlew assembleRelease

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Common fixes:
    echo 1. Make sure Android SDK is installed
    echo 2. Run: sdkmanager "platforms;android-34" "build-tools;34.0.0"
    echo 3. Check mobile\android\local.properties has sdk.dir set
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD SUCCESSFUL!
echo ============================================
echo.
echo APK Location:
echo %PROJECT_DIR%mobile\android\app\build\outputs\apk\release\app-release.apk
echo.
echo Next steps:
echo 1. Copy APK to your phone via USB/Bluetooth
echo 2. On phone: Enable "Install from Unknown Sources"
echo 3. Tap the APK file to install
echo.

set /p OPEN_FOLDER="Open APK folder? (Y/N): "
if /i "%OPEN_FOLDER%"=="Y" (
    explorer "%PROJECT_DIR%mobile\android\app\build\outputs\apk\release"
)

pause

