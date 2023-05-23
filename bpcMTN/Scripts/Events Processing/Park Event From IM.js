/* **************************************************************************************************** */
// When the operator confirms no dispatch, then this script will check if the event is AC Fail/Tamper 
// and if there is a valid iCrypto ref. 
// If all is true then the AC Fail/Tamper events in the Live stack should move to the Parked stack. 
// If not then the events will be cleared
/* **************************************************************************************************** */

var timer = 7200; 			// timer in seconds for SQL queries timeouts
var instanceName = "NLPAG71,1550"; 	// MTN SQL core instance location
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "2202") {
    var slave = Event.GetParam("computer");
    DebugLogString("Park Event From IM: Starting Script with full_event: " + Event.GetParam("full_event"));
    var full_event = Event.GetParam("full_event"); // JSON of info from event
    var json = JSON.parse(full_event); // Parse the JSON into an object
    var WorksBase64 = json.rows[0].WorksBase64;
    DebugLogString("Park Event From IM: json: " + JSON.stringify(json));
    DebugLogString("Park Event From IM: json.rows[0]: " + JSON.stringify(json.rows[0]));

    var region_id = json.rows[0].Region.Id;
    var source_event = json.rows[0].SourceMsgBase64;
    var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
    DebugLogString("Park Event From IM: SourceMsgBase64_b64_decoded: " + SourceMsgBase64_b64_decoded);
    var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");

    // The following values are from "Catching the operators steps in IM workflow" script
    var src_objtype = SourceMsgSplit[0]; // SIGNALTOWER
    var src_objid = SourceMsgSplit[1]; // src_objid
    var src_action = SourceMsgSplit[2];	// Event filtered in the IM

    // siteId and src_objid may be duplicate values
    var siteId = GetObjectIdByParam("SIGNALTOWER", "region_id", region_id);
    var iCryptoRef = GetObjectParam("SIGNALTOWER", siteId, "icrypto");
    var tier = GetObjectParam("SIGNALTOWER", siteId, "tier");	// sitePriority

    switch (src_action) {
        case "AC_FAIL":
            var param1 = " (Zone 000)"
            break;
        case "IM_U_DOOR_CONTACT_TAMPER":
            var param1 = " (Zone 001)"
            break;
        case "IM_U_MOTION_SENSOR_TAMPER":
            var param1 = " (Zone 002)"
            break;
        case "IM_U_VIBRATION_SENSOR_F_TAMPER":
            var param1 = " (Zone 003)"
            break;
        case "IM_U_VIBRATION_SENSOR_S_TAMPER":
            var param1 = " (Zone 004)"
            break;
        case "IM_U_VIBRATION_SENSOR_T_TAMPER":
            var param1 = " (Zone 005)"
            break;
        default:
            var param1 = "unknown";
            break;
    }

    DebugLogString("Park Event From IM: tier: " + tier);
    DebugLogString("Park Event From IM: Event: " + src_action);
    DebugLogString("Park Event From IM: is icrypto empty? " + empty(iCryptoRef));
    DebugLogString("Park Event From IM: iCrypto ref: START <" + iCryptoRef + "> END");
    DebugLogString("Park Event From IM: is the action a TAMPER or AC_FAIL? " + (src_action.indexOf("TAMPER") !== -1 || src_action == "AC_FAIL"));
    // If an event has a valid iCrypto ref for that site and the event is either an AC Fail or a Tamper 
    if (!empty(iCryptoRef) && (src_action.indexOf("TAMPER") !== -1 || src_action == "AC_FAIL")) {
        DebugLogString("Park Event From IM: iCrypto ref: " + iCryptoRef + " for site " + siteId);

        // Create a Parked version of that event
        if (src_action == "AC_FAIL") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_AC_FAIL", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        } else if (src_action == "IM_U_VIBRATION_SENSOR_T_TAMPER") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_TAMPER_VIBRATION_SENSOR_T", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        } else if (src_action == "IM_U_VIBRATION_SENSOR_S_TAMPER") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_TAMPER_VIBRATION_SENSOR_S", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        } else if (src_action == "IM_U_VIBRATION_SENSOR_F_TAMPER") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_TAMPER_VIBRATION_SENSOR_F", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        } else if (src_action == "IM_U_MOTION_SENSOR_TAMPER") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_TAMPER_MOTION_SENSOR", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        } else if (src_action == "IM_U_DOOR_CONTACT_TAMPER") {
            DebugLogString("Park Event From IM: Recreating Parked " + src_action + " for site: " + siteId);
            NotifyEventStr("SIGNALTOWER", siteId, "P_TAMPER_DOOR_CONTACT", "siteId<" + siteId + ">,param1<" + param1 + ">,region_id<" + region_id + ">,tier<" + tier + ">");
        }
        // Set the status of the event to "3" so that the event is hidden in the IM but visible in the DB
        clearSignalTowerEventsFromIM(siteId, src_action);
        messageAction("Event moved to Parked Stack", slave)
        DebugLogString("Park Event From IM: The event was successfully moved from the Live Stack to the Parked Stack by the operator");
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

// Dynamically set the event with status=3
function clearSignalTowerEventsFromIM(Id, event) {
    DebugLogString("Park Event From IM: Deleting Signal Tower " + Id + " " + event + " event from IM.");
    DoReactStr("INC_SERVER", "1", "UPDATE_STATUS", "status<3>,objtypes<SIGNALTOWER>,objids<" + Id + ">,actions<" + event + ">"); // Update status for SIGNALTOWER with siteId var. Status = 3 - closed
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 60, 'Moved to Parked', 64 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};