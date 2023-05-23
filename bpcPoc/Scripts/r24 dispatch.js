
var endpoint = "https://us-central1-response24-sa-prod.cloudfunctions.net/bidvest/action-tower/v1";	// R24 endpoint
var timeout = 20000; // timeout before cURL query execution termination
var headers = "-H \"Content-type: application/json\"";
var computer = "AXXONDEMO1";
var opcieId = "5";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 1200) {

    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var towerId = Event.GetParam("number");
    var isUpdateCall = Event.GetParam("update") == "true"
    DebugLogString(timestamp + "; R24 dispatch: starting R24 dispatch action for site " + towerId + " by computer " + computer + "...");

    if (!empty(towerId) && (!empty(computer))) {

        // JSON parsing:
        var run = sendRequestToR24();
        var json = JSON.parse(run);
        
        // Popup:
        if (!isUpdateCall) {
            messageAction("R24 Call", "R24 request for the site \"" + towerId + "\" has been initiated!", computer);
            messageAction("R24 Call", "R24 response:\\r\\nStatus message: " + json.message + "\\r\\nState: " + json.data.state + "\\r\\nState History length: " + json.data.stateHistory.length, computer);
        }
        DebugLogString(timestamp + "; R24 dispatch: the reference for dispatch is: " + json.data.key);

        // Events:
        NotifyEventStr("SIGNALTOWER", towerId, "R24_DISPATCH", "param0<" + json.data.key + ">,param1<" + json.data.stateHistory[0].state + ">"); // producing ST event for R24 dispatch (can be quered from PROTOCOL)
        SetObjectParam("SIGNALTOWER", towerId, "r24", "" + json.data.stateHistory[0].state + "");	// Setting ST parameter with the current state of dispatch
        NotifyEventStr("SIGNALTOWER", towerId, "R24_INFO", "param0<" + json.data.key + ">,param1<" + json.data.stateHistory[0].state + ">"); // ST event producing (can be quered from PROTOCOL)

        // Dispatch time:
        if (empty(Itv_var(towerId + "_r24_dispatchTime"))) {
            Itv_var(towerId + "_r24_dispatchTime") = Event.GetParam("time");
            Itv_var(towerId + "_r24_dispatchFullTime") = Event.GetParam("date") + " " + Event.GetParam("time");
        }

        // HTML page update:
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setAllInfo>,towerCode<" + towerId + ">,popTime<30>");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setDispatchTime>,dispatchTime<" + Itv_var(towerId + "_r24_dispatchTime") + ">,fullTimestamp<" + Itv_var(towerId + "_r24_dispatchFullTime") + ">");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setState>,state<" + json.data.stateHistory[0].state + ">,key<" + json.data.key + ">");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<autoUpdate>,computer<" + computer + ">");

        var lastItemOfArray = json.data.stateHistory.length - 1;
        var wholeArrayofMessages = "";

        for (i = 0; i < json.data.stateHistory.length; i++) {
            if (!(isValidURL(json.data.stateHistory[i].message))) {
                DebugLogString(timestamp + "; R24 script: json.data.stateHistory[" + i + "].dateUpdated._seconds is " + json.data.stateHistory[i].dateUpdated._seconds);
                var d = new Date(json.data.stateHistory[i].dateUpdated._seconds * 1000);
                wholeArrayofMessages += d.toLocaleString() + " — " + json.data.stateHistory[i].message + "|";
            } else {
                wholeArrayofMessages += json.data.stateHistory[i].message + "|";
            }
        }
        DebugLogString(timestamp + "; R24 update: whole array of messages is: " + wholeArrayofMessages);

        DebugLogString(timestamp + "; R24 update: the update for site \"" + towerId + "\": stateHistory last message is " + json.data.stateHistory[lastItemOfArray].message + ".");
        NotifyEventStr("SIGNALTOWER", towerId, "R24_INFO", "param0<" + json.data.key + ">,param1<" + json.data.state + ">,param2<" + json.data.stateHistory[lastItemOfArray].message + ">");
        DoReactStr("OPCIE", opcieId, "FUNC", "func_name<setState>,state<" + json.data.stateHistory[0].state + ">,message<" + wholeArrayofMessages + ">,key<" + json.data.key + ">");
    }
};

function messageAction(header, msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, '" + header + "', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function sendRequestToR24() {
    var r24_payload = "\\\"siteId\\\":\\\"123456\\\",\\\"apiKey\\\":\\\"capi-2e317-99b3-bd44b3-c6354723ec99b\\\",\\\"state\\\": \\\"open\\\"";
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