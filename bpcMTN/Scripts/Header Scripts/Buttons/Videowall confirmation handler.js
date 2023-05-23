if (Event.SourceType == "MACRO" && Event.SourceId == 502 && Event.Action == "RUN") {
    var towerId = Event.GetParam("number");
    var towerIdNumeric = towerId.replace(/[^0-9]/g, '');
    var slave = Event.GetParam("computer");

    if (!empty(towerIdNumeric) && isNumeric(towerIdNumeric)) {

        var towerNamePre = GetObjectName("SIGNALTOWER", "T" + towerIdNumeric);

        if (towerNamePre == "__error_value") {
            messageAction("No tower found with this ID!", slave);
        } else {
            popupConfirmation(slave, towerIdNumeric);
        }
    }
}

function popupConfirmation(slave, number) {
    var cmd = "nircmd.exe exec hide C:\\choice.bat " + number;
    DebugLogString("Calling this: " + cmd + " on computer " + slave);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
}

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
}

function isNumeric(num) {
    return !isNaN(num)
}

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Warning', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
}