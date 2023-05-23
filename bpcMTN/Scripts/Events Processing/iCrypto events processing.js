// This script process the messages from iCrypto Access Control 3rd party system
// When iCrypto Ref is incoming, signal tower gets parked or BPC parked (depending on the user ID received)
// When iCrypto Ref is expired

var timer = 7200; 			// timer in seconds for automatic site unparking
var instanceName = "NLPAG71,1550"; 	// MTN SQL core instance location
var dbName = "PSIM";
var sqlUser = "SQL_Auth_Account_For_PSIM";
var sqlPass = "@F%L)Dfhq123asduiop#$577pMg_";

//var instanceName = ".\\SQLEXPRESS"; 	// Laptop setup for testing
//var dbName = "new7";
//var sqlUser = "sa";
//var sqlPass = "Intellect_default_DB_4";

if (Event.SourceType == "MACRO" && Event.SourceId == 5000 && Event.Action == "RUN")	// trigger on MACRO|5000|RUN

{
    var event = Event.GetParam("param2");
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");

    var eventJson = JSON.parse(event);						// parsing the JSON from the events parameters. TODO: check the lengthy messages, are they coming?

    if (!empty(eventJson["_source"]["audit-site-id"])) {				// only process if site id is not empty

        var siteId = "T" + eventJson["_source"]["audit-site-id"];				// adding the T symbol to numeric siteId
        var siteState = GetObjectState("SIGNALTOWER", siteId);				// grabbing the site state
        var audit_uid = eventJson["_source"]["audit-uid"];				// grabbing the uuid of user
        var userId = getUserId(audit_uid);						// grabber the user id in Intellect for that user uuid
        var patronymic = GetObjectParam("PERSON", userId, "patronymic");
        var regionId = GetObjectParam("SIGNALTOWER", siteId, "region_id");		// region ID

        // Parking entire site via ACCESS_ENABLED event:

        if (eventJson["_source"]["audit-action"] == "SAR_ACCESS_ENABLED") 		// parking the site here
        {
            DebugLogString("iCrypto processing script: received from iCrypto Access Enable event for site " + siteId + ". Current state of ST is \"" + siteState + "\". The user guid is " + audit_uid + " and patronymic field is \"" + patronymic + "\".");

            if (!empty(audit_uid) && (patronymic.indexOf("BTS Technical") !== -1)) {
                SetObjectState("SIGNALTOWER", siteId, "BPC_PARKED");		// BPC parking if user's patronymic consists of "BTS Technical"
                NotifyEventStr("SIGNALTOWER", siteId, "PARKED_BPC", "param0<" + eventJson["_source"]["audit-site-request"] + ">,param1<" + eventJson["_source"]["audit-msisdn"] + ">");
            } else {
                NotifyEventStr("SIGNALTOWER", siteId, "AUTHORISED", "param0<" + eventJson["_source"]["audit-site-request"] + ">,param1<" + eventJson["_source"]["audit-msisdn"] + ">");
                SetObjectState("SIGNALTOWER", siteId, "PARKED");			// Normal parking if user's patronymic does not have "BTS Technical"
            }
            DebugLogString("iCrypto processing script: the site " + siteId + " is now in state " + GetObjectState("SIGNALTOWER", siteId) + " because of valid iCrypto Ref.");
            SetObjectParam("SIGNALTOWER", siteId, "icrypto", eventJson["_source"]["audit-site-request"]);	// settings the iCrypto param for the ST object
            SetObjectParam("SIGNALTOWER", siteId, "last_state_timestamp", timestamp);				// last state change timestamp

            // Settings Global variables here (they are needed for the AccessRef handler button):
            Itv_var(siteId + "request") = eventJson["_source"]["audit-site-request"];
            Itv_var(siteId + "msisdn") = eventJson["_source"]["audit-msisdn"];
            Itv_var(siteId + "timestamp") = eventJson["_source"]["@timestamp"];
            Itv_var(siteId + "uid") = eventJson["_source"]["audit-uid"];
            Itv_var(siteId + "loc") = eventJson["_source"]["audit-loc"];
            Itv_var(siteId + "area") = eventJson["_source"]["audit-site-id"];
            DebugLogString("iCrypto processing script: setting global varibables. Phone for site " + siteId + " is: " + Itv_var(siteId + "msisdn"));

            //deleteSignalTowerEvents(siteId);
            clearEventsIMPresenceFlags(siteId);

            SetTimer(siteId, timer * 1000) // setting timer of automatic tower unparking
        }

        // Unparking entire site because of received STANDDOWN or EXPIRED event:

        if ((eventJson["_source"]["audit-action"] == "SAR_STANDDOWN") || (eventJson["_source"]["audit-action"] == "SAR_EXPIRED")) {
            DebugLogString("iCrypto processing script: unparking site " + siteId + "...");
            SetObjectState("SIGNALTOWER", siteId, "NORMAL");				// setting state of tower to NORMAL
            SetObjectParam("SIGNALTOWER", siteId, "icrypto", "");			// setting to empty iCrypto param of ST
            SetObjectParam("SIGNALTOWER", siteId, "last_state_timestamp", timestamp);	// last state change timestamp
            // Producing un-authorized event:
            NotifyEventStr("SIGNALTOWER", siteId, "UNAUTHORIZED", "param0<" + eventJson["_source"]["audit-site-request"] + ">,param1<" + eventJson["_source"]["audit-site-request"] + ">");
            // unsettings the global variables:
            Itv_var(siteId + "request") = "";
            Itv_var(siteId + "msisdn") = "";
            Itv_var(siteId + "timestamp") = "";
            Itv_var(siteId + "uid") = "";
            Itv_var(siteId + "loc") = "";
            Itv_var(siteId + "area") = "";
            DebugLogString("iCrypto processing script: the site " + siteId + " is now in state " + GetObjectState("SIGNALTOWER", siteId));

            deleteSignalTowerEvents(siteId);					// deleting the Parked Signaltowers events
            clearEventsIMPresenceFlags(siteId);
        }
    }
};


// Unparking the tower automatically after the timer expires:
if (Event.SourceType == "LOCAL_TIMER" && Event.Action == "TRIGGERED") {
    var siteId = Event.SourceId;
    KillTimer(Event.SourceId);	// Killing timer
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");

    DebugLogString("iCrypto processing script: unparking site " + siteId + " automatically after 2 hours...");
    SetObjectState("SIGNALTOWER", siteId, "NORMAL");				// setting state of tower to NORMAL
    SetObjectParam("SIGNALTOWER", siteId, "icrypto", "");			// setting to empty iCrypto param of ST
    SetObjectParam("SIGNALTOWER", siteId, "last_state_timestamp", timestamp);	// last state change timestamp
    // Producing un-authorized event:
    NotifyEventStr("SIGNALTOWER", siteId, "UNAUTHORIZED", "param0<automatic>,param1<automatic>");
    // unsettings the global variables:
    Itv_var(siteId + "request") = "";
    Itv_var(siteId + "msisdn") = "";
    Itv_var(siteId + "timestamp") = "";
    Itv_var(siteId + "uid") = "";
    Itv_var(siteId + "loc") = "";
    Itv_var(siteId + "area") = "";
    DebugLogString("iCrypto processing script: automatic unparking: the site " + siteId + " is now in state " + GetObjectState("SIGNALTOWER", siteId));

    deleteSignalTowerEvents(siteId);					// deleting the Parked Signaltowers events
    clearEventsIMPresenceFlags(siteId);

};

/*
function changeStateOfVMDA(state, vmdaIds) {
//DebugLogString("iCrypto processing script: changeStateOfVMDA: launch with parameters: state: "+state+"; VMDAs: "+vmdaIds);
switch(state) {
    case 0:
        action = "DISARM";
        logLine = "DISARMING of";
        break;
    case 1:
        action = "ARM";
        logLine = "ARMING of";
        break;
    default:
        action = "UNKNOWN";
        logLine = "Doing nothing for";
        break;
    }
for (w=0; w < vmdaIds.length; w++) {
    var VMDAname = GetObjectName("CAM_VMDA_DETECTOR",vmdaIds[w]);
    if (!empty(vmdaIds[w]) && (VMDAname != "__error_value")) {
        DoReactStr("CAM_VMDA_DETECTOR",vmdaIds[w],action,"");
        DebugLogString("iCrypto processing script: changeStateOfVMDA: "+logLine+" VMDA object "+vmdaIds[w]+" \""+VMDAname+"\"...");
        }
    }
};
*/
function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};
/*
function getCamerasFromRegion(reg) {
    var cmdCams = "sqlcmd -U \""+sqlUser+"\" -P \""+sqlPass+"\" -S \""+instanceName+"\" -d "+dbName+" -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [dbo].[OBJ_CAM] where [region_id] = '"+reg.replace(/(\r\n|\n|\r)/gm, "")+"';\"";
    var cmd = run_cmd_timeout(cmdCams, 5000);
    DebugLogString("iCrypto processing script: getCamerasFromRegion: cameras SQL query result: "+cmd);
    return cmd.replace(/(\r\n|\n|\r)/gm, "");
};
*/
/*
function getVMDAIdsFromCameras(cameras) {
    var detectorIds = [];
    var split = cameras.split(",");
    for (j=0; j < split.length; j++) {
        detectorIds.push(GetObjectChildIds("CAM",split[j],"CAM_VMDA_DETECTOR"));
        }
    DebugLogString("iCrypto processing script: getVMDAIdsFromCameras: gathered detectors "+detectorIds+" from "+cameras);
    return detectorIds;
};
*/

function deleteSignalTowerEvents(Id) {
    DebugLogString("iCrypto processing script: deleteSignalTowerParkedEvents: deleting Signal Tower " + Id + " events from IM.");
    DoReactStr("INC_SERVER", "1", "UPDATE_STATUS", "status<3>,objtypes<SIGNALTOWER>,objids<" + Id + ">");
};

function clearEventsIMPresenceFlags(site) {
    for (i = 1; i <= 10; i++) {		// setting the im_zone flags to "0"
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i, "0");
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i + "_bypass", "0");
        SetObjectParam("SIGNALTOWER", site, "im_zone" + i + "_tamper", "0");
    }
};

/*function deleteVVSevents(dets) {
if (dets.length != 0) { 
    differentSeparator = dets.join("|");
    DebugLogString("iCrypto processing script: deleteVVSevents: deleting SIGNALTOWER with ID(s) "+differentSeparator+" ALARM and PARKED_ALARM events from IM.");
    DoReactStr("INC_SERVER","1","UPDATE_STATUS","status<3>,objtypes<SIGNALTOWER>,objids<"+differentSeparator+">,actions<PARKED_ALARM|ALARM>");
    } else {
    DebugLogString("iCrypto processing script: deleteVVSevents: Warning! Array length is "+dets.length+". Not executing this function!");
    }
};
*/

function getUserId(guid) {
    var cmd = "sqlcmd -U \"" + sqlUser + "\" -P \"" + sqlPass + "\" -S \"" + instanceName + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP 1 [id] FROM [dbo].[OBJ_PERSON] WHERE [OBJ_PERSON].[guid] = '" + guid + "';\"";
    var result = run_cmd_timeout(cmd, 7000).replace(/(\r\n|\n|\r)/gm, "");
    DebugLogString("iCrypto processing script: getUserId: found user id \"" + result + "\" for guid \"" + guid + "\"");
    return result;
};