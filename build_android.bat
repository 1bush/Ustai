@echo off
cd /d "C:\Users\roven\Desktop\ustai-app claude"
echo Building USTAI release APK (standalone, no Metro required)
cd android
call gradlew.bat --stop 2>nul
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
cd ..
call npx expo export:embed --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res > bundle_output.txt 2>&1
if errorlevel 1 exit /b 1
cd android
call gradlew.bat assembleRelease --no-daemon > ..\build_output.txt 2>&1
if errorlevel 1 exit /b 1
cd ..
if not exist android\app\build\outputs\apk\release\app-release.apk exit /b 1
copy /y android\app\build\outputs\apk\release\app-release.apk ..\ustai-app-release.apk >nul
echo BUILD SUCCESSFUL: C:\Users\roven\Desktop\ustai-app-release.apk
exit /b 0
