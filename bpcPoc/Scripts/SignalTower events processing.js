/*
Zone states description:
normal - 0
bypass - 1
tamper - 2
overactive first stage - 3
overactive sencond stage - 4
*/

// Last edited 17-05-2022 by Anton (added the events closure when receiving Burglary as per Donovan's comments)

var sqlUserName = "PSIM"
var sqlPassword = "Intellect_default_db_4"
var sqlInstance = "10.4.110.62\\VPSIM"
var db = "dataservice"

if (Event.SourceType == "MACRO" && Event.SourceId == 3000 && Event.Action == "RUN") {	// Macro 3000 is used for SignalTower integration
    var id = "999";				// override
    var newName = Event.GetParam("param2");
    var i = Event.GetParam("param1");
    var towerState = GetObjectState("SIGNALTOWER", id);					// current state of the whole tower
    var regionId = GetObjectParam("SIGNALTOWER", id, "region_id");
    var tier = GetObjectParam("SIGNALTOWER", id, "tier");
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var param1 = Event.GetParam("param1");
    var param3 = Event.GetParam("param3");
    var zoneName = newName;
    var zoneStateName = i;

    if (!empty(id) && !empty(newName) && !empty(i)) { // only proceed if those 3 parameters are not empty

        // Deleting FTT events from all stacks (excluding the case where tower is BPC_PARKED because they need to see those events): - 01.04.2022 DISABLED because it was causing slow performance
        //if ((GetObjectState("SIGNALTOWER",id) == "NORMAL") || (GetObjectState("SIGNALTOWER",id) == "") || (GetObjectState("SIGNALTOWER",id) == "PARKED")) {
        //deleteSignalToweFTTEvents(id);
        //}

        var currentZoneState = GetObjectParam("SIGNALTOWER", id, zoneStateName + "state");
        SetObjectParam("SIGNALTOWER", id, "last_message", newName);			// setting the last message for the tower
        SetObjectParam("SIGNALTOWER", id, "last_timestamp", timestamp);		// and its timestamp
        DebugLogString(timestamp + " SignalTower processing script: event received: tower: \"" + id + "\"; state of tower: \"" + towerState + "\"; type of event \"" + newName + "\"; zone \"" + zoneName + "\" state is: \"" + currentZoneState + "\".");
        var actionString = ""
        if ((newName == "Unknown") && (i != "(Zone 000)")) { // Producing event for unrecognized zone for tracing/debugging:
            DebugLogString(timestamp + "!Warning! SignalTower processing script: zone is unrecognized! Event: tower ID is " + id + ", type is " + newName + ", zone is " + i + ", tower state is " + towerState);
            NotifyEventStr("SIGNALTOWER", id, "UNRECOGNIZED_ZONE", "param1<" + i + ">");
            actionString = "UNRECOGNIZED_ZONE"
        }

        // Handling AC Loss, AC Restore, Low Battery ST events for NORMAL and PARKED states:
        if (newName == "AC Loss" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            DebugLogString(timestamp + "SignalTower processing script: producing AC_FAIL event for tower " + id + " with 5 seconds delay");
            NotifyEventStr("SIGNALTOWER", id, "AC_FAIL", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,delay<5>");
            actionString = "AC_FAIL"
        }

        if (newName == "AC Restore" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            NotifyEventStr("SIGNALTOWER", id, "AC_RESTORE", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "AC_RESTORE"
        }

        if (newName == "Low Battery" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            NotifyEventStr("SIGNALTOWER", id, "LOW_BATTERY", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "LOW_BATTERY"
        }

        // New editions 17.07.2022 for EBM PoC:
        if (newName == "Close" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            NotifyEventStr("SIGNALTOWER", id, "CLOSE", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "CLOSE"
        }

        if (newName == "Open (By User)" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            NotifyEventStr("SIGNALTOWER", id, "OPEN", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "OPEN"
        }

        if (newName == "Alarm)" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
            NotifyEventStr("SIGNALTOWER", id, "ALARM", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "ALARM"
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! SignalTower PARKED state !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Parked Burglary events producing, if site is parked:
        if (((towerState == "PARKED")) && (newName.toUpperCase() == "BURGLARY")) { // Only produce if zone state is not currently overactive

            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"P_" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "P_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "P_" + newName
            if ((currentZoneState == "1" || currentZoneState == "2" || empty(currentZoneState)) && (currentZoneState != "0" || currentZoneState != "3" || currentZoneState != "4")) { // Only change the zone state to normal if: the current zone state is not normal; current zone is either tamper, bypass or empty
                changeZoneState(id, zoneStateName, "0");
                deleteSignalTowerEvents(id, "P_" + newName + "_TAMPER|P_" + newName + "_BYPASS");
            }
        }

        // Zone/sensor Bypass events producing, if site is parked:
        if (((towerState == "PARKED")) && (newName.toUpperCase() == "ZONE/SENSOR BYPASS")) {

            if (currentZoneState != "1" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to bypass if: the current zone state is not bypass already AND if not overactive
                changeZoneState(id, zoneStateName, "1");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"P_BYPASS" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "P_BYPASS_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = "P_BYPASS_" + newName
        }

        // Tampers, if site is parked, will still generate an unauthorized event - because of BPC logic:
        if (((towerState == "PARKED")) && ((newName.toUpperCase() == "TAMPER") || (newName == "Sensor Tamper"))) {

            if (currentZoneState != "2" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to tamper if: the current zone state is not tamper already AND if not overactive
                changeZoneState(id, zoneStateName, "2");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"" + newName + "_TAMPER\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, newName + "_TAMPER", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = newName + "_TAMPER"
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! SignalTower NORMAL state !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Motion sensor on unauthorized:
        //  if (((towerState == "0") || (towerState == ""))) { // Only produce if zone state is not currently overactive

        if (newName != null) {
            //if (param1 == " (Zone 002)") {
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = newName
            //}
            if ((currentZoneState == "1" || currentZoneState == "2" || empty(currentZoneState)) && (currentZoneState != "0" || currentZoneState != "3")) {	// Only change the zone state to normal if: the current zone state is not normal; current zone is either tamper, bypass or empty
                changeZoneState(id, zoneStateName, "0");
                deleteSignalTowerEvents(id, newName + "_TAMPER|U_" + newName + "_BYPASS");
            }
        }

        // Tampers on unauthorized:
        if (towerState == "0") {

            if (currentZoneState != "2" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to tamper if: the current zone state is not tamper already
                changeZoneState(id, zoneStateName, "2");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"" + newName + "_TAMPER\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, newName + "_TAMPER", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = newName + "_TAMPER"
        }

        // Zone/sensor Bypass events handling on unauthorized:
        if (towerState == "0") {

            if (currentZoneState != "1" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to bypass if: the current zone state is not bypass already
                changeZoneState(id, zoneStateName, "1");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"" + newName + "_BYPASS\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, newName + "_BYPASS", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            actionString = newName + "_BYPASS"
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! SignalTower BPC_PARKED state !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // As per Donovan Whatsapp on 19.04.2022, the zone states are not required when tower is in BPC_PARKED state (When BPC Tech is on site):

        if (towerState == "BPC_PARKED") {
            DebugLogString(timestamp + "SignalTower processing script: iCrypto timestamp is " + Itv_var(id + "timestamp"));
            if (!empty(Itv_var(id + "timestamp"))) {
                var iCryptoSplit = Itv_var(id + "timestamp").split("T");
                var iCryptoDate = iCryptoSplit[0].replace(/-/g, '');
                var iCryptoTime = iCryptoSplit[1].split(".");
                var iCryptoTime2 = iCryptoTime[0].replace(/:/g, '');
                var OBnumber = id + "-" + iCryptoDate + "-" + iCryptoTime2;
                DebugLogString(timestamp + "SignalTower processing script: OB Number is " + OBnumber);
            } else {
                var OBnumber = "Failed to get";
            }

            if (newName.toUpperCase() == "BURGLARY") {
                NotifyEventStr("SIGNALTOWER", id, "B_" + newName + "", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            } else if (newName == "Zone/Sensor Bypass") {
                NotifyEventStr("SIGNALTOWER", id, "B_BYPASS_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            } else if ((newName == "Tamper") || (newName == "Sensor Tamper")) {
                NotifyEventStr("SIGNALTOWER", id, "B_TAMPER_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            } else if (newName == "AC Loss") {
                NotifyEventStr("SIGNALTOWER", id, "B_ACLOSS", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            } else if (newName == "AC Restore") {
                NotifyEventStr("SIGNALTOWER", id, "B_ACRESTORE", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            } else if (newName == "Low Battery") {
                NotifyEventStr("SIGNALTOWER", id, "B_LOWBATTERY", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
            }
        }
        DebugLogString(timestamp + " Signaltower processing script: Adding the site ID: " + id + "; action: " + actionString + "; Region ID " + regionId + "; zone " + i + " to custom table ")
        doSQLInsert(id, actionString, regionId, i)
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};

function deleteSignalTowerEvents(Id, zones) {
    DebugLogString(timestamp + " Signaltower processing script: deleteSignalTowerEvents(" + Id + "): deleting SIGNALTOWER events \"" + zones + "\" from IM...");
    DoReactStr("INC_SERVER", "1", "UPDATE_STATUS", "status<3>,objtypes<SIGNALTOWER>,objids<" + Id + ">,actions<" + zones + ">"); 	// Status = 3 - means the event is closed (processed)
};

function changeZoneState(towerId, zoneId, state) {
    DebugLogString(timestamp + " Signaltower processing script: changeZoneState(): changing tower ID \"" + towerId + "\" zone \"" + zoneId + "state\" to the state " + state);
    SetObjectParam("SIGNALTOWER", towerId, zoneId + "state", state);		// Setting the zone state here
    SetObjectParam("SIGNALTOWER", towerId, zoneId + "timestamp", timestamp);	// Setting the zone state timestamp here
    // DebugLogString("SIGNALTOWER", towerId, zoneId + "timestamp", timestamp);
};

function doSQLInsert(objid, action, region_id, zone) {
    //DebugLogString("SignalTower events processing: doSQLInsert: pushing steps data to the SQL "+sqlInstance);
    var query = "\"INSERT INTO signaltower_processing (objid, action, region_id, zone, date) ";
    var query2 = "VALUES ('" + objid + "', '" + action + "', '" + region_id + "', '" + zone + "', GETDATE())\"";
    var cmd = "sqlcmd -U " + sqlUserName + " -P " + sqlPassword + " -S \"" + sqlInstance + "\" -d " + db + " -Q " + query + "" + query2 + "";
    DebugLogString("SignalTower events processing: doSQLInsert: cmd is: " + cmd);
    var run = run_cmd_timeout(cmd, 2000);
    DebugLogString("SignalTower events processing: doSQLInsert: cmd result is: " + run.replace(/(\r\n|\n|\r)/gm, ""));
};