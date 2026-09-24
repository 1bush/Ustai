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
echo    This may take 2-5 minutes...
cd android
call npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output app\src\main\assets\index.android.bundle --assets-dest app\src\main\res > "%~dp0bundle_output.txt" 2>&1
cd ..
if errorlevel 1 (
    echo.
    echo ===========================================
    echo  JS BUNDLING FAILED - see bundle_output.txt
    echo ===========================================
    type "%~dp0bundle_output.txt"
    goto :eof
)
echo.

echo [4/5] Building RELEASE APK (this may take several minutes)...
cd android
call gradlew.bat assembleRelease --no-daemon > "%~dp0build_output.txt" 2>&1
cd ..
echo.

echo [5/5] Checking results...
if exist android\app\build\outputs\apk\release\app-release.apk (
    echo.
    echo ===========================================
    echo  BUILD SUCCESSFUL - install THIS on phones!
    echo ===========================================
    echo.
    echo APK location:
    echo   android\app\build\outputs\apk\release\app-release.apk
    dir android\app\build\outputs\apk\release\app-release.apk
    copy /y android\app\build\outputs\apk\release\app-release.apk "..\ustai-app-release.apk" >nul
    echo Also copied to: C:\Users\roven\Desktop\ustai-app-release.apk
) else if exist android\app\build\outputs\apk\debug\app-debug.apk (
    echo.
    echo ===========================================
    echo  BUILD SUCCESSFUL (DEBUG) - install THIS on phones!
    echo ===========================================
    echo.
    echo APK location:
    echo   android\app\build\outputs\apk\debug\app-debug.apk
    dir android\app\build\outputs\apk\debug\app-debug.apk
    copy /y android\app\build\outputs\apk\debug\app-debug.apk "..\ustai-app-debug.apk" >nul
    echo Also copied to: C:\Users\roven\Desktop\ustai-app-debug.apk
) else (
    echo.
    echo ===========================================
    echo  BUILD FAILED
    echo ===========================================
    echo.
    echo Check build_output.txt for details
    if exist "%~dp0build_output.txt" (
        echo.
        echo Last 50 lines of build_output.txt:
        echo ----------------------------------------
        for /f "skip=-50" %%L in ('type "%~dp0build_output.txt"') do echo %%L
    )
)
echo.
goto :eof