/*
Zone states description:
normal - 0
bypass - 1
tamper - 2
overactive - 3
*/

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 507) {
    var tower = Event.GetParam("towerId");
    var computer = Event.GetParam("computer");

    if (!empty(tower) && !empty(computer)) {
        DebugLogString("In Open zone states script")
        var states = [];
        var timestamps = [];
        var vmdaZoneStates = [];
        var vmdaZoneTimeStamps = [];
        for (i = 1; i < 6; i++) {
            states[i] = GetObjectParam("SIGNALTOWER", tower, "zone" + i + "state");
            timestamps[i] = GetObjectParam("SIGNALTOWER", tower, "zone" + i + "timestamp");
            if (empty(timestamps[i])) {
                timestamps[i] = "N/A";
            }
        }
        DebugLogString("Before second loop")
        for (j = 1; j < 6; j++) {
            var prefix = "";
            if (j < 3) { // Get CC1 and CC2 VMDA zone states and timestamps
                prefix = "cc" + j;
            } else { // Get TC1, TC2 and TC3 VMDA zone states and timestamps
                var zone = j - 2;
                prefix = "tc" + zone;
            }
            DebugLogString("Open the zone states menu: prefix is: " + prefix);
            vmdaZoneStates[j] = GetObjectParam("SIGNALTOWER", tower, prefix + "state");
            vmdaZoneTimeStamps[j] = GetObjectParam("SIGNALTOWER", tower, prefix + "timestamp");

            if (empty(vmdaZoneStates[j])) {
                vmdaZoneStates[j] = "N/A";
            }
            if (empty(vmdaZoneTimeStamps[j])) {
                vmdaZoneTimeStamps[j] = GetObjectParam("SIGNALTOWER", tower, prefix + "lastmessage");
            }
            if (empty(vmdaZoneTimeStamps[j])) {
                vmdaZoneTimeStamps[j] = "N/A";
            }
            DebugLogString("Open the zone states menu: vmdaZoneState of " + prefix + " is: " + vmdaZoneStates[j]);
            DebugLogString("Open the zone states menu: vmdaZoneTimeStamp of " + prefix + " is: " + vmdaZoneTimeStamps[j]);
        }
        DebugLogString("Finished second loop")

        var towerState = GetObjectState("SIGNALTOWER", tower);
        if (empty(towerState)) {
            towerState = "NORMAL";
        }

        var message = "";
        var message2 = "";

        var last_operator_action = GetObjectParam("SIGNALTOWER", tower, "last_operator_action");
        if (empty(last_operator_action)) {
            last_operator_action = "N/A";
        }

        var last_state_timestamp = GetObjectParam("SIGNALTOWER", tower, "last_state_timestamp");
        if (empty(last_state_timestamp)) {
            last_state_timestamp = "N/A";
        }
        DebugLogString("Making Message")
        message = "Tower " + tower + " state is " + towerState + "\\r\\n";
        message += "Last state change was at " + last_state_timestamp + "\\r\\n";
        message += "Last time actioned at " + last_operator_action + "\\r\\n\\r\\n";
        message += "Door Contact: " + getFriendlyNameOfZone(states[1]) + "; changed at: " + timestamps[1] + "\\r\\n";
        message += "Motion Sensor: " + getFriendlyNameOfZone(states[2]) + "; changed at: " + timestamps[2] + "\\r\\n";
        message += "Vibration 1: " + getFriendlyNameOfZone(states[3]) + "; changed at: " + timestamps[3] + "\\r\\n";
        message += "Vibration 2: " + getFriendlyNameOfZone(states[4]) + "; changed at: " + timestamps[4] + "\\r\\n";
        message += "Vibration 3: " + getFriendlyNameOfZone(states[5]) + "; changed at: " + timestamps[5] + "\\r\\n";

        message2 += "CC1: " + getFriendlyNameOfVMDAZone(vmdaZoneStates[1]) + "; changed at: " + vmdaZoneTimeStamps[1] + "\\r\\n";
        message2 += "CC2: " + getFriendlyNameOfVMDAZone(vmdaZoneStates[2]) + "; changed at: " + vmdaZoneTimeStamps[2] + "\\r\\n";
        message2 += "TC1: " + getFriendlyNameOfVMDAZone(vmdaZoneStates[3]) + "; changed at: " + vmdaZoneTimeStamps[3] + "\\r\\n";
        message2 += "TC2: " + getFriendlyNameOfVMDAZone(vmdaZoneStates[4]) + "; changed at: " + vmdaZoneTimeStamps[4] + "\\r\\n";
        message2 += "TC3: " + getFriendlyNameOfVMDAZone(vmdaZoneStates[5]) + "; changed at: " + vmdaZoneTimeStamps[5] + "\\r\\n";

        DebugLogString("Showing Message")
        messageAction(message, 60, "Tower Info", computer);
        messageAction(message2, 90, "Tower Info", computer);
        DebugLogString("End of Zone States Script")
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function messageAction(msg, duration, header, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', " + duration + ", '" + header + "', 64 );close()\"";
    DebugLogString("cmd is " + cmd);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function getFriendlyNameOfZone(state) {
    switch (state) {
        case "0":
            name = "Normal";
            break;
        case "1":
            name = "Bypass";
            break;
        case "2":
            name = "Tamper";
            break;
        case "3":
            name = "Overactive";
            break;
        default:
            name = "Normal";
    }
    return name;
};

function getFriendlyNameOfVMDAZone(state) {
    var stateStr = ""
    switch (state) {
        case "3":
            stateStr = "Overactive";
            break;
        case "4":
            stateStr = "Overactive";
            break;
        default:
            stateStr = "Normal";
    }
    return stateStr;
};