set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
@echo off

@REG ADD "HKLM\SOFTWARE\WOW6432Node\ITV\Intellect" /v "Core IP Address" /t REG_SZ /d "10.245.39.101" /f

@taskkill /im slave.exe /f
REM @taskkill /im intellect.exe /f
REM @taskkill /im intellect64.exe /f
REM @timeout /t 2 /nobreak
ping 127.0.0.1 -n 10 > NUL

REM @start "PSIM" "C:\Program Files (x86)\Intellect\Slave.exe"
cmd /c "C:\Program Files (x86)\Intellect\Slave.exe"

@goto exit

:exit