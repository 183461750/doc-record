@echo off
echo @Author Fate
echo @Date Mon Jan 24 2020 10:00:56 GMT+0800
:again
set /p REPOSITORY_PATH=Please enter the local your maven warehouse path:
:: Remove all double quotes
set REPOSITORY_PATH=%REPOSITORY_PATH:"=%
if not exist "%REPOSITORY_PATH%" (
   echo Maven warehouse address not found, please try again.
   goto again
)
for /f "delims=" %%i in ('dir /b /s "%REPOSITORY_PATH%\*lastUpdated*"') do (
   del /s /q "%%i"
)
echo Expired files deleted successfully.
pause;