@echo off

set number=%1

for /f "usebackq" %%f in ( `mshta "javascript:new ActiveXObject('Scripting.FileSystemObject').GetStandardStream(1).Write(new ActiveXObject('WScript.Shell').PopUp('Do you confirm sending event from tower %number% to the Videowall?',0,'Confirmation',36));close();"` ) do ( if "%%f"=="6" ( curl "http://10.244.39.101:8070/intellect_core/React?command=MACRO|503|RUN|slave<BTS12>,number<%number%>" ) else if "%%f"=="7" ( echo NO ))