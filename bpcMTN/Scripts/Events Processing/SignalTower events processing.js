/*
Zone states description:
normal - 0
bypass - 1
tamper - 2
overactive first stage - 3
overactive second stage - 4
*/

// Last edited: Use Github

if (Event.SourceType == "MACRO" && Event.SourceId == 3000 && Event.Action == "RUN") {	// Macro 3000 is used for SignalTower integration
    var id = Event.GetParam("param0");
    var type = Event.GetParam("param2");
    var zone = Event.GetParam("param1").substring(1);
    var towerState = GetObjectState("SIGNALTOWER", id);					// current state of the whole tower
    var regionId = GetObjectParam("SIGNALTOWER", id, "region_id");
    var tier = GetObjectParam("SIGNALTOWER", id, "tier");
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var param1 = Event.GetParam("param1");
    var param3 = Event.GetParam("param3");

    // id:T3505, type:Burglary, zone:(Zone 001), towerState:NORMAL, regionId:6.483, tier:Tier 2, 
    // timestamp:24-08-22 15:58:42, param1: (Zone 001), param3:0937 - T3505
    DebugLogString("Event Values are: id:" + id + ", type:" + type + ", zone:" + zone + ", towerState:" + towerState + ", regionId:" + regionId + ", tier:" + tier + ", timestamp:" + timestamp + ", param1:" + param1 + ", param3:" + param3)

    DebugLogString(timestamp + " SignalTower processing script: Is the variable empty? " + empty(Itv_var(id + "_" + zone + "_STZoneCount")));
    // Going through the trouble of using the Date object to reformat the date as YYYY-MM-DD instead of DD-MM-YY
    var betterDate = new Date();
    var day = betterDate.getDate();
    var month = (betterDate.getMonth() + 1);
    var year = betterDate.getFullYear();
    var fullDateTime = year + "-" + month + "-" + day + " " + Event.GetParam("time");
    // Initialize the global variable if it doesn't exist
    if (empty(Itv_var(id + "_" + zone + "_STZoneCount"))) {
        DebugLogString(timestamp + " SignalTower processing script: Initializing the variable");
        Itv_var(id + "_" + zone + "_STZoneCount") = 0;
    }
    // Make it an integer
    var counter = parseInt(Itv_var(id + "_" + zone + "_STZoneCount"));
    DebugLogString(timestamp + " SignalTower processing script: Detector count with ID of " + id + " and zone " + zone + " is " + counter);
    Itv_var(id + "_" + zone + "_STZoneCount") = ++counter; // Add to the counter
    Itv_var(id + "_" + zone + "_STZoneTime") = fullDateTime; // Timestamp the counter increment
    Itv_var(id + "_" + zone + "_STZoneEvent") = type; // Save the event name
    DebugLogString(timestamp + " SignalTower processing script: Detector count with ID of " + id + " and zone " + zone + " is now " + Itv_var(id + "_" + zone + "_STZoneCount"));

    // Deleting FTT events from all stacks (excluding the case where tower is BPC_PARKED because they need to see those events): - 01.04.2022 DISABLED because it was causing slow performance
    //if ((GetObjectState("SIGNALTOWER",id) == "NORMAL") || (GetObjectState("SIGNALTOWER",id) == "") || (GetObjectState("SIGNALTOWER",id) == "PARKED")) {
    //deleteSignalToweFTTEvents(id);
    //}

    switch (zone) {
        case "(Zone 001)":
            var zoneName = "Door Contact";
            var newName = "DOOR_CONTACT";
            var zoneStateName = "zone1";
            var isKnownZone = true;
            break;
        case "(Zone 002)":
            var zoneName = "Motion Sensor";
            var newName = "MOTION_SENSOR";
            var zoneStateName = "zone2";
            var isKnownZone = true;
            break;
        case "(Zone 003)":
            var zoneName = "Vibration 1";
            var newName = "VIBRATION_SENSOR_F";
            var zoneStateName = "zone3";
            var isKnownZone = true;
            break;
        case "(Zone 004)":
            var zoneName = "Vibration 2";
            var newName = "VIBRATION_SENSOR_S";
            var zoneStateName = "zone4";
            var isKnownZone = true;
            break;
        case "(Zone 005)":
            var zoneName = "Vibration 3";
            var newName = "VIBRATION_SENSOR_T";
            var zoneStateName = "zone5";
            var isKnownZone = true;
            break;
        default:
            var zoneName = "Zone 000";
            var newName = "UNKNOWN";
            var zoneStateName = "zoneUnknown";
            var isKnownZone = false;
    }

    var currentZoneState = GetObjectParam("SIGNALTOWER", id, zoneStateName + "state");
    SetObjectParam("SIGNALTOWER", id, "last_message", type);			// setting the last message for the tower
    SetObjectParam("SIGNALTOWER", id, "last_timestamp", timestamp);		// and its timestamp
    DebugLogString(timestamp + " SignalTower processing script: event received: tower: \"" + id + "\"; state of tower: \"" + towerState + "\"; type of event \"" + type + "\"; zone \"" + zoneName + "\" state is: \"" + currentZoneState + "\".");

    if ((newName == "UNKNOWN") && (zone != "(Zone 000)")) { // Producing event for unrecognized zone for tracing/debugging:
        DebugLogString(timestamp + "!Warning! SignalTower processing script: zone is unrecognized! Event: tower ID is " + id + ", type is " + type + ", zone is " + zone + ", tower state is " + towerState);
        NotifyEventStr("SIGNALTOWER", id, "UNRECOGNIZED_ZONE", "param1<" + zone + ">");
    }

    // Handling AC Loss, AC Restore, Low Battery ST events for NORMAL and PARKED states:
    if (type == "AC Loss" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
        DebugLogString(timestamp + "SignalTower processing script: producing AC_FAIL event for tower " + id + " with 5 seconds delay");
        NotifyEventStr("SIGNALTOWER", id, "AC_FAIL", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,delay<5>");
    }

    if (type == "AC Restore" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
        NotifyEventStr("SIGNALTOWER", id, "AC_RESTORE", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
    }

    if (type == "Low Battery" && ((towerState == "NORMAL") || (towerState == "") || (towerState == "PARKED"))) {
        NotifyEventStr("SIGNALTOWER", id, "LOW_BATTERY", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
    }

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!! SignalTower BPC_PARKED state !!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // As per Donovan Whatsapp on 19.04.2022, the zone states are not required when tower is in BPC_PARKED state (When BPC Tech is on site):

    if (towerState == "BPC_PARKED") {
        DebugLogString(timestamp + " SignalTower processing script: iCrypto timestamp is " + Itv_var(id + "timestamp"));
        if (!empty(Itv_var(id + "timestamp"))) {
            var iCryptoSplit = Itv_var(id + "timestamp").split("T");
            var iCryptoDate = iCryptoSplit[0].replace(/-/g, '');
            var iCryptoTime = iCryptoSplit[1].split(".");
            var iCryptoTime2 = iCryptoTime[0].replace(/:/g, '');
            var OBnumber = id + "-" + iCryptoDate + "-" + iCryptoTime2;
            DebugLogString(timestamp + " SignalTower processing script: OB Number is " + OBnumber);
        } else {
            var OBnumber = "Failed to get";
        }

        if (type.toUpperCase() == "BURGLARY") {
            NotifyEventStr("SIGNALTOWER", id, "B_" + newName + "", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        } else if (type == "Zone/Sensor Bypass") {
            NotifyEventStr("SIGNALTOWER", id, "B_BYPASS_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        } else if ((type == "Tamper") || (type == "Sensor Tamper")) {
            NotifyEventStr("SIGNALTOWER", id, "B_TAMPER_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        } else if (type == "AC Loss") {
            NotifyEventStr("SIGNALTOWER", id, "B_ACLOSS", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        } else if (type == "AC Restore") {
            NotifyEventStr("SIGNALTOWER", id, "B_ACRESTORE", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        } else if (type == "Low Battery") {
            NotifyEventStr("SIGNALTOWER", id, "B_LOWBATTERY", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">,obnumber<" + OBnumber + ">");
        }
    }

    if (!empty(id) && !empty(type) && isKnownZone) { // only proceed if zone is known

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! SignalTower PARKED state !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Parked Burglary events producing, if site is parked:
        if (((towerState == "PARKED")) && (type.toUpperCase() == "BURGLARY") && isKnownZone) { // Only produce if zone state is not currently overactive

            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"P_" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "P_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");

            if ((currentZoneState == "1" || currentZoneState == "2" || empty(currentZoneState)) && (currentZoneState != "0" || currentZoneState != "3" || currentZoneState != "4")) { // Only change the zone state to normal if: the current zone state is not normal; current zone is either tamper, bypass or empty
                changeZoneState(id, zoneStateName, "0");
                deleteSignalTowerEvents(id, "IM_P_" + newName + "_TAMPER|IM_P_" + newName + "_BYPASS");
            }
        }

        // Zone/sensor Bypass events producing, if site is parked:
        if (((towerState == "PARKED")) && (type.toUpperCase() == "ZONE/SENSOR BYPASS")) {

            if (currentZoneState != "1" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to bypass if: the current zone state is not bypass already AND if not overactive
                changeZoneState(id, zoneStateName, "1");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"P_BYPASS" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "P_" + newName + "_BYPASS", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
        }

        // Tampers, if site is parked, will still generate an unauthorized event - because of BPC logic:
        if (((towerState == "PARKED")) && ((type.toUpperCase() == "TAMPER") || (type == "Sensor Tamper"))) {

            if (currentZoneState != "2" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to tamper if: the current zone state is not tamper already AND if not overactive
                changeZoneState(id, zoneStateName, "2");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing PARKED event \"U_" + newName + "_TAMPER\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "U_" + newName + "_TAMPER", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
        }

        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // !!! SignalTower NORMAL state !!!
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Motion sensor on unauthorized:
        if (((towerState == "NORMAL") || (towerState == "")) && (type.toUpperCase() == "BURGLARY") && (currentZoneState != "3" || currentZoneState != "4")) { // Only produce if zone state is not currently overactive

            //if (param1 == " (Zone 002)") {
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"U_" + newName + "\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "U_" + newName, "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
            //}
            if ((currentZoneState == "1" || currentZoneState == "2" || empty(currentZoneState)) && (currentZoneState != "0" || currentZoneState != "3")) {	// Only change the zone state to normal if: the current zone state is not normal; current zone is either tamper, bypass or empty
                changeZoneState(id, zoneStateName, "0");
                deleteSignalTowerEvents(id, "IM_U_" + newName + "_TAMPER|IM_U_" + newName + "_BYPASS");
            }
        }

        // Tampers on unauthorized:
        if (((towerState == "NORMAL") || (towerState == "")) && ((type.toUpperCase() == "TAMPER") || (type == "Sensor Tamper"))) {

            if (currentZoneState != "2" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to tamper if: the current zone state is not tamper already
                changeZoneState(id, zoneStateName, "2");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"U_" + newName + "_TAMPER\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "U_" + newName + "_TAMPER", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
        }

        // Zone/sensor Bypass events handling on unauthorized:
        if (((towerState == "NORMAL") || (towerState == "")) && (type.toUpperCase() == "ZONE/SENSOR BYPASS")) {

            if (currentZoneState != "1" || currentZoneState != "3" || currentZoneState != "4") { // Only change the zone state to bypass if: the current zone state is not bypass already
                changeZoneState(id, zoneStateName, "1");
            }
            DebugLogString(timestamp + " Signaltower processing script: producing NORMAL event \"U_" + newName + "_BYPASS\" for tower " + id);
            NotifyEventStr("SIGNALTOWER", id, "U_" + newName + "_BYPASS", "siteId<" + id + ">,param1<" + param1 + ">,param3<" + param3 + ">,region_id<" + regionId + ">,tier<" + tier + ">");
        }
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
};