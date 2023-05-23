
var endpoint = "https://us-central1-response24-sa-prod.cloudfunctions.net/bidvest/action-tower/v1";	// R24 endpoint
var timeout = 20000; // timeout before cURL query execution termination
var headers = "-H \"Content-type: application/json\"";
var computer = "AXXONDEMO1";
var opcieId = "5";


if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 1201) {

    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var towerId = Event.GetParam("number");
    DebugLogString(timestamp + "; R24 close: starting R24 close action for site " + towerId + " by computer " + computer + "...");

    if (!empty(towerId) && (!empty(computer))) {

        messageAction("R24 Close", "R24 close request for the site " + towerId + " has been initiated!", computer);

        // JSON parsing:
        var run = sendRequestToR24();

        // Popup:
        messageAction("R24 Close", "R24 close call response:\\r\\nStatus message: " + run + "\\r\\", computer);

        // Events:
        NotifyEventStr("SIGNALTOWER", towerId, "R24_CLOSE", ""); // producing ST event for R24 dispatch (can be quered from PROTOCOL)
        SetObjectParam("SIGNALTOWER", towerId, "r24", "");	// Setting ST parameter with the current state of dispatch

        // Dispatch time:
        Itv_var(towerId + "_r24_dispatchTime") = "";
        Itv_var(towerId + "_r24_dispatchFullTime") = "";
        Itv_var(towerId + "_r24_key") = ""; // clearing global variables of the dispatch

        // HTML page update:
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<clearDispatchTimes>,dispatchTime<>");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setState>,state<Completed>");	// sending the closed state to HTML page
    }
};

function messageAction(header, msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, '" + header + "', 4096 );close();\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function sendRequestToR24() {
    var r24_payload = "\\\"siteId\\\":\\\"123456\\\",\\\"apiKey\\\":\\\"capi-2e317-99b3-bd44b3-c6354723ec99b\\\",\\\"state\\\": \\\"terminated\\\"";
    var cmd = "curl " + headers + " --url \"" + endpoint + "\" --data \"{" + r24_payload + "}\" -X POST";
    DebugLogString(timestamp + "; R24 dispatch: sendRequestToR24(): the cmd for the call is: " + cmd);

    var execution = run_cmd_timeout(cmd, timeout);

    DebugLogString(timestamp + "; R24 dispatch: sendRequestToR24(): the execution outcome is: " + execution);
    return execution;
};

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};