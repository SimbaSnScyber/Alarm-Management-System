
var time = Event.GetParam("date") + " " + Event.GetParam("time");
var fromEmail = "PSIM_UAT@proteacoin.co.za"
var toEmail = "Steynfaardtd@proteacoin.co.za"
var ccEmail = "mchaur@proteacoin.co.za"
var subject = "PSIM Notification"
var body = ""

if (Event.SourceType == "FAILOVER" && Event.Action == "START" && Event.SourceId == 1) {

    DebugLogString("Sending Email script: Fail over has occurred.");
    subject = subject + ": Failover has occurred"
    body = "Attention! Failover on NL01 has occurred"

    DoReactStr("MAIL_MESSAGE", "1", "SETUP", "from<" + fromEmail + ">,to<" + toEmail + ">,body<" + body + ">,parent_id<1>,subject<" + subject + ">,name<Message 1>,objname<Message 1>");
    DoReactStr("MAIL_MESSAGE", "1", "SEND", "");
} else if (Event.SourceType == "TIMER" && Event.SourceId == "12" && Event.Action == "TRIGGER") {

}