
var time = Event.GetParam("date") + " " + Event.GetParam("time"); // DD-MM-YY hh:mm:ss
var instanceNameNL01 = "NLPAG71,1550";		// MTN SQL core - some of the data is being gathered from there
var dbNameNL01 = "PSIM";				// 
var sqlUserNL01 = "SQL_Auth_Account_For_PSIM";
var sqlPassNL01 = "@F%L)Dfhq123asduiop#$577pMg_";

var actionDB = "dataservice";	// DB where to insert the data
var actionTablename = "operator_action"; // name of the table
var instanceNameFL01 = "10.245.39.101\\SQLEXPRESS2014"; // SQL instance where to insert the data (FL01)
var sqlUserFL01 = "PSIM";				// SQL login
var sqlPassFL01 = "\"YSPW7509-sywj!#O%&\"";	// SQL password

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 2205) {

    var slave = Event.GetParam("computer");
    DebugLogString("KPI Countdown: Starting Script with full_event: " + Event.GetParam("full_event"));
    var full_event = Event.GetParam("full_event"); // JSON of info from event
    // var json = JSON.parse(full_event); // Parse the JSON into an object
    // var WorksBase64 = json.rows[0].WorksBase64;
    // DebugLogString("KPI Countdown: json: " + JSON.stringify(json));
    // DebugLogString("KPI Countdown: json.rows[0]: " + JSON.stringify(json.rows[0]));

    // var region_id = json.rows[0].Region.Id;
    // var source_event = json.rows[0].SourceMsgBase64;
    // var SourceMsgBase64_b64_decoded = Base64Decode(source_event, 0);
    // DebugLogString("Move Event to Live From IM: SourceMsgBase64_b64_decoded: " + SourceMsgBase64_b64_decoded);
    // var SourceMsgSplit = SourceMsgBase64_b64_decoded.split("|");

    // // The following values are from "Catching the operators steps in IM workflow" script
    // var src_objtype = SourceMsgSplit[0]; // SIGNALTOWER
    // var src_objid = SourceMsgSplit[1]; // siteId
    // var src_action = SourceMsgSplit[2];	// Event filtered in the IM

    
    // Grid HTML Interface ID for all stacks go here
    var timerOpcie;
    var not_found = true
    switch (slave) {
        case "BTS01":
            break;
        case "BTS02":
            break;
        case "BTS03":
            break;
        case "BTS04":
            break;
        case "BTS05":
            break;
        case "BTS06":
            break;
        case "BTS07":
            break;
        case "BTS08":
            break;
        case "BTS09":
            timerOpcie = 9;
            not_found = false;
            break;
        case "BTSWALL1":
            break;
        case "BTS10":
            break;
        case "BTS11":
            break;
        case "BTS12":
            break;
        case "MEYERM3":
            break;
        default:
            not_found = true;
    }
    
    if (!not_found) {
        DoReactStr("OPCIE", timerOpcie, "FUNC", "func_name<stopTimer>");
    }

}

// Use the match function to split the date value into an array with just the number values of the date
// Then use the number values to create a new Date object
function parseDate(input) {
    DebugLogString(timestamp + " VMDA processing script: parseDate: " + input)
    // input values: 14-07-22 15:09:24
    var parts = input.match(/(\d+)/g);
    // parts values: day, month, year, hours, minutes, seconds
    DebugLogString(timestamp + " VMDA processing script: parseDate: parts is " + parts)
    // new Date(year, month, date[, hours[, minutes[, seconds[,ms]]]])
    // parts[2] format is YY so we just make it YYYY | TODO Update in 100 years time
    var date = new Date("20" + parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);
    DebugLogString(timestamp + " VMDA processing script: parseDate: new Date to return is " + date)
    return date;
};

function getTimeDifference(old_value) {
    var diff = parseDate(timestamp) - parseDate(old_value);
    DebugLogString(timestamp + " VMDA processing script::getTimeDifference(): old value " + old_value + "; existing value is " + timestamp);
    DebugLogString(timestamp + " VMDA processing script::getTimeDifference(): difference is " + diff / 1000);

    if (diff / 1000 >= 130) {		// if last trigger was more than 2 minutes ago
        return true;
    } else {
        return false;
    }
};