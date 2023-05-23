if (Event.SourceType == "MACRO" && Event.SourceId == 720 && Event.Action == "RUN") {

    var slave = Event.GetParam("slave_id");
    var split = slave.split(".");

    if (Event.GetParam("action") == "expand") {
        DebugLogString("Expanding R24 HTML window with id " + split[1]);
        NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<31>,w<34>,h<55>");
    }
    if (Event.GetParam("action") == "minimize") {
        DebugLogString("Minimizing R24 HTML window with id " + split[1]);
        NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<31>,w<20>,h<24>");
    }
}