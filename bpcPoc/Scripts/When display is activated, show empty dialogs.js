// If Display is activated on the client computer, show dialogs empty to not confuse operators

if (Event.SourceType == "DISPLAY" && Event.Action == "ACTIVATED") {
    var slaveId = Event.GetParam("param0");
    var displayName = GetObjectName("DISPLAY", Event.SourceId)

    DebugLogString("Display activated script: Computer is: " + slaveId);
    switch (slaveId) {
        case "AXXONDEMO1":
            var mon = [1];
            not_found = false;
            break;
        case "STEYNFAARDTD":
            var mon = [1];
            not_found = false;
            break;
        default:
            mon = [545];
            not_found = true;
    }

    if (!not_found) {
        DoReactStr("DIALOG", "" + slaveId + "-Tower", "CLOSE", "");

        DoReactStr("DIALOG", "" + slaveId + "-Tower", "RUN", "number<>");
    }
};
