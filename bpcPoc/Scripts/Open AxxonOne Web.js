if (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == "501") {
    DoReactStr("SLAVE", "AXXONDEMO1", "CREATE_PROCESS", "command_line<\"http://172.24.0.228:80/\">");
};