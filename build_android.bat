@echo off
cd /d "C:\Users\roven\Desktop\ustai-app claude"
echo ===========================================
echo  Building ustai-app Android RELEASE APK
echo  (standalone - no Metro / adb needed)
echo ===========================================
echo.
echo [1/5] Stopping Gradle daemons...
cd android
call gradlew.bat --stop 2>nul
echo.
echo [2/5] Cleaning build directories...
if exist .gradle rmdir /s /q .gradle 2>nul
if exist build rmdir /s /q build 2>nul
if exist app\build rmdir /s /q app\build 2>nul
cd ..
echo.
echo [3/5] Bundling JavaScript into the APK (expo export:embed)...
call npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res 2>&1 | tee "%~dp0bundle_output.txt"
if errorlevel 1 (
    echo.
    echo ===========================================
    echo  JS BUNDLING FAILED - see bundle_output.txt
    echo ===========================================
    pause
    exit /b 1
)
echo.
echo [4/5] Building RELEASE APK (this may take several minutes)...
cd android
call gradlew.bat assembleRelease --no-daemon 2>&1 | tee "%~dp0build_output.txt"
echo.
echo [5/5] Checking results...
if exist app\build\outputs\apk\release\app-release.apk (
    echo.
    echo ===========================================
    echo  BUILD SUCCESSFUL - install THIS on phones!
    echo ===========================================
    echo.
    echo APK location:
    echo   %~dp0android\app\build\outputs\apk\release\app-release.apk
    dir app\build\outputs\apk\release\app-release.apk
    copy /y app\build\outputs\apk\release\app-release.apk "%~dp0..\ustai-app-release.apk" >nul
    echo Also copied to: C:\Users\roven\Desktop\ustai-app-release.apk
) else (
    echo.
    echo ===========================================
    echo  BUILD FAILED
    echo ===========================================
    echo.
    echo Check build_output.txt for details
)
echo.
pause
