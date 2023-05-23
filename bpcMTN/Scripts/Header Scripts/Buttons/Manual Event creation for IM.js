// This script creates MANUAL_ESCALATE events for the tower via the tower dialog

// macro initiated via tower dialog
if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 508) {

    var slave = Event.GetParam("computer"); // grabbing parameters
    var siteId = Event.GetParam("number")
    var towerNumber = siteId.replace(/[^0-9]/g, '');
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time")

    if (!empty(towerNumber)) {

        var towerNamePre = GetObjectName("SIGNALTOWER", "T" + towerNumber);
        DebugLogString(timestamp + " Manual events processing: tower \"" + towerNumber + "\" has name " + towerNamePre);

        if ((towerNamePre == "__error_value") || !(isNumeric(towerNumber))) {
            DebugLogString(timestamp + " Manual events processing: tower was not found!");
            messageAction("No tower found with ID " + towerNumber + "!", slave);
        } else {
            id = "T" + towerNumber;
            NotifyEventStr("SIGNALTOWER", id, "MANUAL_ESCALATE", "region_id<" + GetObjectParam("SIGNALTOWER", id, "region_id") + ">,tier<" + GetObjectParam("SIGNALTOWER", id, "tier") + ">");
            messageAction(timestamp + " Manual alert has been created for tower " + id + "!", slave);
            DebugLogString(timestamp + " Manual events processing: created SIGNALTOWER|MANUAL_ESCALATE event for tower " + id + " from computer " + slave);
        }
    } else {
        messageAction("Please enter the tower ID in the dialog!", slave);
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function isNumeric(num) {
    return !isNaN(num)
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'Manual events creation', 64 );close()\"";
    //DebugLogString(cmd);
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};