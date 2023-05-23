if (Event.SourceType == "MACRO" && Event.SourceId == 722 && Event.Action == "RUN") {

    var slave = Event.GetParam("slave_id");
    var split = slave.split(".");

    if (Event.GetParam("action") == "expand") {
        DebugLogString("Expanding Grid HTML window with id " + split[1]);
        NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<59>,w<49>,h<45>");
    }
    if (Event.GetParam("action") == "minimize") {
        DebugLogString("Minimizing Grid HTML window with id " + split[1]);
        NotifyEventStr("CORE", "", "UPDATE_OBJECT", "objtype<OPCIE>,objid<" + split[1] + ">,y<0>,x<51>,w<49>,h<24>");
    }
}