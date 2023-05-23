//var endpoint = "https://soab2bqaesf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/event";
//var headers = "-H \"Content-type: application/json\" -H \"Authorization: Basic U1ZDX1NJR05BTFRPV0VSX0IyQk9TQl9JTlZERVY6WTBpNFZsYVdQTVE2OXZRRw==\"";
var endpoint = "https://soab2besf.mtn.co.za:20260/event-management/enterprise/proxy/api/v1/event";
var timeout = 20000;
var headers = "-H \"Content-type: application/json\"";
var auth = "--user SVC_PSIM_B2BOSB_INVOKE:JvcF9ZNy9BnKyamq";
var executionServer = "Fairlands";

if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 1003) {
    var referenceId = Itv_var("T" + Event.GetParam("number") + "_r24_key");
    var computer = Event.GetParam("computer");

    var opcieId = []
    switch (computer) {
        case "BTS01":
            opcieId = [23, 24, 25, 26];
            break;
        case "BTS02":
            opcieId = [27, 28, 29];
            break;
        case "BTS03":
            opcieId = [30, 31, 32];
            break;
        case "BTS04":
            opcieId = [4, 34, 35];
            break;
        case "BTS05":
            opcieId = [3, 5, 6];
            break;
        case "BTS06":
            opcieId = [20, 38, 40];
            break;
        case "BTS07":
            opcieId = [41, 42, 46];
            break;
        case "BTS08":
            opcieId = [48, 49, 51];
            break;
        case "BTS09":
            opcieId = [1, 9, 10, 12, 13, 15];
            break;
        case "BTS10":
            opcieId = [52, 54, 55, 57, 58];
            break;
        case "BTSWALL1":
            opcieId = [16, 18, 19, 37];
            break;
        case "BTS11":
            opcieId = [60, 61, 64, 65, 66];
            break;
        case "BTS12":
            opcieId = ["824"];
            break;
        default:
            opcieId = ["999"];
    }

    DebugLogString("R24 update: dispatch update action received for site " + Event.GetParam("number") + " with reference key " + referenceId + " by computer " + computer + ". Failover flag is: " + Itv_var("Failover_flag") + ".");

    if (!empty(Event.GetParam("number")) && (!empty(computer)) && (!empty(referenceId)) && (Itv_var("Failover_flag") == "True")) {
        DebugLogString("R24 update: starting dispatch update action for site " + Event.GetParam("number") + " with reference key " + referenceId + " by computer " + computer + "...");
        //messageAction(executionServer+": update request for site \""+Event.GetParam("number")+"\" has been sent.\\r\\nReference ID used is "+referenceId+"",computer);
        var transaction_id = Event.GetParam("guid_pk").replace(/[{}]/g, ""); 	// Event UUID

        var cmd2 = "curl " + headers + " " + auth + " --url \"" + endpoint + "?sourceIdentifier=PSIM&transactionId=" + transaction_id + "&referenceId=" + Itv_var("T" + Event.GetParam("number") + "_r24_key") + "\"";
        DebugLogString("R24 update: cmd to execute is: " + cmd2);
        var run2 = run_cmd_timeout(cmd2, timeout);
        DebugLogString("R24 update: computer " + computer + ": cmd execution result is: " + run2);
        var json2 = JSON.parse(run2);

        DebugLogString("R24 update: the update for site \"" + Event.GetParam("number") + "\" resulted in \"" + json2.data[0].state + "\" state. StateHistory length is " + json2.data[0].stateHistory.length + ".");
        var lastItemOfArray = json2.data[0].stateHistory.length - 1;

        var wholeArrayofMessages = "";

        for (i = 0; i < json2.data[0].stateHistory.length; i++) {
            if (!(isValidURL(json2.data[0].stateHistory[i].message))) {
                var d = new Date(json2.data[0].stateHistory[i].dateUpdated.seconds * 1000);
                wholeArrayofMessages += d.toLocaleString() + " — " + json2.data[0].stateHistory[i].message + "|";
            } else {
                wholeArrayofMessages += json2.data[0].stateHistory[i].message + "|";
            }
        }

        DebugLogString("R24 update: the update for site \"" + Event.GetParam("number") + "\": stateHistory last message is " + json2.data[0].stateHistory[lastItemOfArray].message + ".");

        NotifyEventStr("SIGNALTOWER", "T" + Event.GetParam("number"), "R24_INFO", "param0<" + referenceId + ">,param1<" + json2.data[0].state + ">,param2<" + json2.data[0].stateHistory[lastItemOfArray].message + ">");

        for (i = 0; i < opcieId.length; i++) {
            DoReactStr("OPCIE", opcieId[i], "FUNC", "func_name<setState>,state<" + json2.data[0].state + ">,message<" + wholeArrayofMessages + ">,referenceId<" + referenceId + ">");
        }
    }
};

function messageAction(msg, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 10, 'R24 update', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g, "") === "") { return true; }
    else { return false; }
};

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};