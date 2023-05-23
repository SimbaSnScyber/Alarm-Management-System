var dbName = "PSIM";
var timeout = 7000;
var sqlUserMTN = "SQL_Auth_Account_For_PSIM";
var sqlPassMTN = "@F%L)Dfhq123asduiop#$577pMg_";
var instanceNameMTN = "NLPAG71,1550";

if (Event.SourceType == "MACRO" && Event.SourceId == 503 && Event.Action == "RUN") {
    var slaveId = "BTS12";
    var mon = "25";
    var tower = Event.GetParam("number");
    var towerWithPrefix = "";
    if (tower.indexOf("D") !== -1) {
        towerWithPrefix = "D" + tower;
    } else if (tower.indexOf("TX") !== -1) {
        towerWithPrefix = "TX" + tower;
    } else if (tower.indexOf("T") !== -1) {
        towerWithPrefix = "T" + tower;
    } else if (tower.indexOf("X") !== -1){
        towerWithPrefix = "X" + tower;
    } else {
        towerWithPrefix = "T" + tower;
    }

    DoReactStr("MONITOR", mon, "REMOVE_ALL", "");

    DebugLogString("Display site " + tower + " pressed on " + slaveId + "...");
    var cmdRegion = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT TOP 1 [id] FROM [PSIM].[dbo].[OBJ_REGION] WHERE [name] LIKE '" + towerWithPrefix + " %';\"";
    var runRegion = run_cmd_timeout(cmdRegion, 10000);
    DebugLogString("SQL for region is: " + cmdRegion);
    DebugLogString("Result for region is: " + runRegion);
    if (!empty(runRegion)) {
        var cmdCams = "sqlcmd -U \"" + sqlUserMTN + "\" -P \"" + sqlPassMTN + "\" -S \"" + instanceNameMTN + "\" -d " + dbName + " -W -h -1 -Q \"SET NOCOUNT ON; SELECT STRING_AGG([id], ',') FROM [PSIM].[dbo].[OBJ_CAM] where [region_id] = '" + runRegion.replace(/(\r\n|\n|\r)/gm, "") + "';\"";
        var runCams = run_cmd_timeout(cmdCams, 10000);
        DebugLogString("SQL for cams: " + cmdCams);
        DebugLogString("Cameras are: " + runCams);
        if (!empty(runCams)) {

            var s = runCams.split(",");
            for (k = 0; k < s.length; k++) {
                DoReactStr("MONITOR", mon, "ADD_SHOW", "cam<" + parseInt(s[k]) + ">");
            }
        }
    }
}


function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
}
