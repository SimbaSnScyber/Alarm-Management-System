if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 505) {

    //DoReactStr("OPCIE",3,"DISABLE","");
    //DoReactStr("OPCIE",3,"ENABLE","");

    var zoneId = Event.GetParam("towerId").split("-");
    var computer = Event.GetParam("computer");
    var received_time = Event.GetParam("received_time");
    DebugLogString(received_time);

    time2 = received_time.split(" ");
    time3 = time2[0].split("-");
    new_time = time3[1] + "-" + time3[0] + "-" + time3[2] + " " + time2[1];
    DebugLogString(new_time);
    DebugLogString(zoneId[1]);

    DoReactStr("OPCIE", 3, "FUNC", "func_name<sendMessage>,camera<" + zoneId[1] + ">,node<BTSGJ2>");
    DoReactStr("OPCIE", 3, "FUNC", "func_name<changeCamera>,camera<" + zoneId[1] + ">,node<BTSGJ2>,delay<1>");

    DoReactStr("OPCIE", 3, "FUNC", "func_name<setTime>,camera<" + zoneId[1] + ">,node<BTSGJ2>,received_time<" + new_time + ">,delay<3>");
};
