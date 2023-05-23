if ((Event.SourceType == "FAILOVER" && Event.Action == "START" && Event.SourceId == 1) || (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 16)) {
    DebugLogString("IM Failover: Deactivating BTS09 IM to show FL IM")
    // for (var i = 1; i < 10; i++) {
    //     var id = ""
    //     var computer = ""
    //     switch (i) {
    //         case 1:
    //             id = "1"
    //             computer = "BTS09"
    //             break;
    //         default:
    //             break;
    //     }
    // }
    NotifyEventStr("SLAVE", "BTS09", "DEACTIVATE_ALL_DISP", "except<38>");
    DoReactStr("DISPLAY", "38", "ACTIVATE", "__slave_id<BTS09>"); // Test
} else if ((Event.SourceType == "FAILOVER" && Event.Action == "STOP" && Event.SourceId == 1) || (Event.SourceType == "MACRO" && Event.Action == "RUN" && Event.SourceId == 16)) {
    DebugLogString("IM Failover: Deactivating BTS09 IM to show FL IM")
    // for (var i = 1; i < 10; i++) {
    //     var id = ""
    //     var computer = ""
    //     switch (i) {
    //         case 1:
    //             id = "1"
    //             computer = "BTS09"
    //             break;
    //         default:
    //             break;
    //     }
    // }
    NotifyEventStr("SLAVE", "BTS09", "DEACTIVATE_ALL_DISP", "except<60>");
    DoReactStr("DISPLAY", "60", "ACTIVATE", "__slave_id<BTS09>"); // Test
}