/* ***************************************************************** */
// Change Zone States for a SignalTower to Normal (0)
/* ***************************************************************** */

var timer = 7200; 			// timer in seconds for SQL queries timeouts
var instanceName = "NLPAG71,1550"; 	// MTN SQL core instance location
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "2204") {
    var computer = Event.GetParam("computer");
    DebugLogString("Change Zone States to Normal: Starting Script with full_event: " + Event.GetParam("full_event"));
    var full_event = Event.GetParam("full_event"); // JSON of info from event
    var json = JSON.parse(full_event); // Parse the JSON into an object
    var WorksBase64 = json.rows[0].WorksBase64;
    DebugLogString("Change Zone States to Normal: json: " + JSON.stringify(json));
    DebugLogString("Change Zone States to Normal: json.rows[0]: " + JSON.stringify(json.rows[0]));

    var region_id = json.rows[0].Region.Id;
    var source_event = json.rows[0].SourceMsgBase64;
    var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
    DebugLogString("Change Zone States to Normal: SourceMsgBase64_b64_decoded: " + SourceMsgBase64_b64_decoded);
    var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");

    // The following values are from "Catching the operators steps in IM workflow" script
    var src_objtype = SourceMsgSplit[0]; // SIGNALTOWER
    var src_objid = SourceMsgSplit[1]; // src_objid
    var src_action = SourceMsgSplit[2];	// Event filtered in the IM

    // siteId and src_objid may be duplicate values
    var tower = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);

    DebugLogString("Change Zone States to Normal: for tower: " + tower);
    DebugLogString("Change Zone States to Normal: for computer: " + computer);
    if (!empty(tower) && !empty(computer)) {
        for (i = 1; i < 6; i++) {
            SetObjectParam("SIGNALTOWER", tower, "zone" + i + "state", "0");
            DebugLogString("Change Zone States to Normal: changing zone: " + "zone" + i + "state" + " for tower " + tower);
        }

        for (j = 1; j < 6; j++) {
            var prefix = "";
            if (j < 3) { // Get CC1 and CC2 VMDA zone states and timestamps
                prefix = "cc" + j;
            } else { // Get TC1, TC2 and TC3 VMDA zone states and timestamps
                var zone = j - 2;
                prefix = "tc" + zone;
            }
            SetObjectParam("SIGNALTOWER", tower, prefix + "state", "0");
            DebugLogString("Change Zone States to Normal: changing zone: " + prefix + "state" + " for tower " + tower);
        }

        DebugLogString("End of Change Zone States to Normal Script")
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 60, 'Moved to Live', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};