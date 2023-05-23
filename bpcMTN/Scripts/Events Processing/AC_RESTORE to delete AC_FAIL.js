// This script in intended to remove AC_Fail events from stacks by setting the events` state to "3" (meaning 'closed') when receiving the AC_Restore event from SignalTower.

if (Event.SourceType == "SIGNALTOWER" && Event.Action == "AC_RESTORE") // trigger on AC_RESTORE

{
    SetTimer(Event.SourceId, 5000); // Setting a local timer for 5000 ms (5 seconds) with timer ID equal to siteID (towerID). Delay is needed when AC_RESTORE comes before AC_FAIL for any reason
    DebugLogString("Setting timer " + Event.SourceId + " for deleting the AC_FAIL and AC_RESTORE events...");
}

if (Event.SourceType == "LOCAL_TIMER" && Event.Action == "TRIGGERED") // Local timer triggered

{
    KillTimer(Event.SourceId); // Ending the timer
    DebugLogString("Killing timer " + Event.SourceId + " for AC_FAIL and AC_RESTORE removal.");

    deleteSignalTowerEvents(Event.SourceId); // calling the function to set states of events with siteId being equal to Event.SourceId
}

function deleteSignalTowerEvents(Id) {
    DebugLogString("Deleting Signal Tower " + Id + " AC_FAIL and AC_RESTORE event from IM.");
    DoReactStr("INC_SERVER", "1", "UPDATE_STATUS", "status<3>,objtypes<SIGNALTOWER>,objids<" + Id + ">,actions<AC_FAIL|AC_RESTORE>"); // Update status for SIGNALTOWER with siteId var. Status = 3 - closed
};