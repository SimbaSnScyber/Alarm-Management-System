For all the dialog files, change the file names to their corresponding workstation name. For example, if you're updating BTS05, all the dialog files should be prefixed with "BTS05-" ie. "BTS05-Data.dlg". 

Within all the dialog files, if there are any references to the workstations' name, edit those to correspond with the workstation being updated. For example if something like this "slave_id<"BTSWALL1">" exists within a dialog file and you're working on BTS05, change it to "slave_id<"BTS05">".

BTS09-BTS12 have Maintenance stacks where BTS01-BTS08 do not. As such, BTS09-BTS12 require a TowerMaintenance dialog file that differs from the Tower dialog. Change the names of those files as well.
