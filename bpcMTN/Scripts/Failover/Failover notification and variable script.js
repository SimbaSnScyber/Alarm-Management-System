// This script sets the failover global variable flag and sends notification about this
// Failover flag (either true of false) is needed for the R24 scripts
// If failover flag is false or not set, Newlands is doing R24 calls
// If failover flag is true, Fairlands is doing R24 calls

var computer = "BTS09"; // pop-up message for this computer

if ((Event.SourceType == "FAILOVER" && Event.Action == "START" && Event.SourceId == 1) || (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "12"))	// start on event of Failover (Newlands to Fairlands)
{
    Itv_var("Failover_flag") = "True";
    var time = Event.GetParam("date") + " " + Event.GetParam("time");
    messageAction("Failover of Newlands Admin server happened at " + time + "! Failover flag is " + Itv_var("Failover_flag") + ".", "Failover", computer);	// pop-up
    DoReactStr("SLAVE", computer, "CREATE_PROCESS", "command_line<C:\\restartFL.bat>");
    DebugLogString("Fail over has occured");
};

if ((Event.SourceType == "FAILOVER" && Event.Action == "STOP" && Event.SourceId == 1) || (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "11")) {
    Itv_var("Failover_flag") = "False";
    var time = Event.GetParam("date") + " " + Event.GetParam("time");
    messageAction("Failback of Newlands Admin server happened at " + time + "! Failover flag is " + Itv_var("Failover_flag") + ".", "Failback", computer);	// pop-up
    DoReactStr("SLAVE", computer, "CREATE_PROCESS", "command_line<C:\\restartNL.bat>");
    DebugLogString("Fail back has occured");
};


if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 14) {
    //    Itv_var("Failover_flag") = "False"; // override the failover flag via MACRO|14|RUN execution
    var time = Event.GetParam("date") + " " + Event.GetParam("time");
    messageAction("Variable for failover flag overrided at " + time + "! Failover flag is " + Itv_var("Failover_flag") + ".", "Warning", computer);
    DebugLogString("Variable for failover flag overrided at " + time + "! Failover flag is " + Itv_var("Failover_flag") + ".");
};


function messageAction(msg, header, slave) {
    var cmd = "mshta \"javascript:var sh=new ActiveXObject( 'WScript.Shell' ); sh.Popup( '" + msg + "', 6000, '" + header + "', 4096 );close()\"";
    DoReactStr("SLAVE", slave, "CREATE_PROCESS", "command_line<" + cmd + ">");
};
