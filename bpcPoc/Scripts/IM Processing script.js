/*
Zones explanation:

door contact - zone1
motion sensor - zone2
vibration sensor 1 - zone3
vibration sensor 2 - zone4
vibration sensor 3  - zone5
tc1 - zone6
tc2 - zone7
tc3 - zone8
cc1 - zone9
cc2 - zone10
*/

if (Event.SourceType == "SIGNALTOWER") {
    var siteId = Event.SourceId;
    var towerState = GetObjectState("SIGNALTOWER", siteId);
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var flag_name = "im_" + Event.GetParam("param1");
    var proceeding = true;
    DebugLogString(flag_name);

    if (towerState != "BPC_PARKED") {

        /*    switch (Event.Action) { 
              case "U_MOTION_SENSOR":
                  var flag_name = "im_zone2";
                  var proceeding = true;
                  break;
              case "P_MOTION_SENSOR":
                  var flag_name = "im_zone2";
                  var proceeding = true;
                  break;
              case "U_MOTION_SENSOR_TAMPER":
                  var flag_name = "im_zone2_tamper";
                  var proceeding = true;
                  break;
              case "U_MOTION_SENSOR_BYPASS":
                  var flag_name = "im_zone2_bypass";
                  var proceeding = true;
                  break;
              case "P_MOTION_SENSOR_BYPASS":
                  var flag_name = "im_zone2_bypass";
                  var proceeding = true;
                  break;
              case "U_DOOR_CONTACT":
                  var flag_name = "im_zone1";
                  var proceeding = true;
                  break;
              case "P_DOOR_CONTACT":
                  var flag_name = "im_zone1";
                  var proceeding = true;
                  break;
              case "U_DOOR_CONTACT_TAMPER":
                  var flag_name = "im_zone1_tamper";
                  var proceeding = true;
                  break;
              case "U_DOOR_CONTACT_BYPASS":
                  var flag_name = "im_zone1_bypass";
                  var proceeding = true;
                  break;
              case "P_DOOR_CONTACT_BYPASS":
                  var flag_name = "im_zone1_bypass";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_F":
                  var flag_name = "im_zone3";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_F":
                  var flag_name = "im_zone3";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_F_TAMPER":
                  var flag_name = "im_zone3_tamper";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_F_BYPASS":
                  var flag_name = "im_zone3_bypass";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_F_BYPASS":
                  var flag_name = "im_zone3_bypass";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_S":
                  var flag_name = "im_zone4";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_S":
                  var flag_name = "im_zone4";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_S_TAMPER":
                  var flag_name = "im_zone4_tamper";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_S_BYPASS":
                  var flag_name = "im_zone4_bypass";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_S_BYPASS":
                  var flag_name = "im_zone4_bypass";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_T":
                  var flag_name = "im_zone5";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_T":
                  var flag_name = "im_zone5";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_T_TAMPER":
                  var flag_name = "im_zone5_tamper";
                  var proceeding = true;
                  break;
              case "U_VIBRATION_SENSOR_T_BYPASS":
                  var flag_name = "im_zone5_bypass";
                  var proceeding = true;
                  break;
              case "P_VIBRATION_SENSOR_T_BYPASS":
                  var flag_name = "im_zone5_bypass";
                  var proceeding = true;
                  break;
              case "TC1":
                  var flag_name = "im_zone6";
                  var proceeding = true;
                  break;
              case "P_TC1":
                  var flag_name = "im_zone6";
                  var proceeding = true;
                  break;
              case "TC2":
                  var flag_name = "im_zone7";
                  var proceeding = true;
                  break;
              case "P_TC2":
                  var flag_name = "im_zone7";
                  var proceeding = true;
                  break;
              case "TC3":
                  var flag_name = "im_zone8";
                  var proceeding = true;
                  break;
              case "CC1":
                  var flag_name = "im_zone9";
                  var proceeding = true;
                  break;
              case "P_CC1":
                  var flag_name = "im_zone9";
                  var proceeding = true;
                  break;
              case "CC2":
                  var flag_name = "im_zone10";
                  var proceeding = true;
                  break;
              case "P_CC2":
                  var flag_name = "im_zone10";
                  var proceeding = true;
                  break;
              default:
                  var flag_name = "unknown";
                  var proceeding = false;
                  break;
          }
          */

        if (proceeding) {
            var im_event_presence = GetObjectParam("SIGNALTOWER", siteId, flag_name);
            DebugLogString(timestamp + " IM processing script: tower " + siteId + " zone " + flag_name + " IM presence is \"" + im_event_presence + "\".");
            if (empty(im_event_presence) || im_event_presence == "0") {
                DebugLogString(timestamp + " IM processing script: producing event " + Event.Action + " for tower  tower " + siteId + "...");
                NotifyEventStr("SIGNALTOWER", siteId, "IM_" + Event.Action, "param0<" + flag_name + "_is_" + im_event_presence + ">,param2<manual>");
                SetObjectParam("SIGNALTOWER", siteId, flag_name, "1");
            }
        } else {
            DebugLogString(timestamp + " IM processing script: tower " + siteId + " zone " + flag_name + " is already present in IM, not creating a new event");
        }
    }
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};