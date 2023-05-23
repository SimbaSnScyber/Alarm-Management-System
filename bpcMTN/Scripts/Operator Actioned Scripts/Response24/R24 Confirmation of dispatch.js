if (Event.SourceType == "MACRO" && Event.SourceId == 999 && Event.Action == "RUN") {
    var towerIdNumberic = Event.GetParam("number");
    var slave = Event.GetParam("computer");

    if (!empty(slave) && !empty(towerIdNumberic)) {
        DebugLogString("R24 Confirmation of dispatch: Calling confirmation to dispatch to site " + towerIdNumberic + " from " + slave);
        popupConfirmation(slave, towerIdNumberic);
    }
};

function popupConfirmation(slave, number) {
    var cmd = "nircmd.exe exec hide C:\\dispatchConfirmation.bat " + number;
    DebugLogString("Calling this: \"" + cmd + "\" on computer " + slave);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};