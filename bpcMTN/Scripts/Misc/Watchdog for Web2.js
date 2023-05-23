var web2_Endpoint = "http://10.244.39.101:8085"; // which IP:port to check

if (Event.SourceType == "TIMER" && Event.SourceId == "11" && Event.Action == "TRIGGER") {
    var timestamp = Event.GetParam("date") + " " + Event.GetParam("time");
    var cmdExecResult = web2WatchDog2();
    DebugLogString(timestamp + " Web 2.0 Watchdog: web-query result is \"" + cmdExecResult + "\"");

    if (empty(cmdExecResult) || cmdExecResult.indexOf("Intellect") == -1) {			// if response is empty or does not have 'Intellect' substring in the response
        DebugLogString(timestamp + " Web 2.0 Watchdog: web-server is not running!");	// Do something here
    }
};

function web2WatchDog2() {
    var query = "powershell -command \"(Invoke-WebRequest -URI " + web2_Endpoint + "/web2/product/version -TimeoutSec 4).Content\"";
    var cmd = run_cmd_timeout(query, 7000);
    return cmd.replace(/(\r\n|\n|\r)/gm, "");
};

function empty(str) {
    if (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str === "") { return true; }
    else { return false; }
};