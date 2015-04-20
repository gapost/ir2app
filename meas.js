var Meas = {
    maxdRdt : 1e-4,
	maxdTdt : 1e-3,
	Tm : [15,16,17,18,20,22,24,26,28,30,33,36,39,42,46,50,55,
		60,66,72,80,90,100,110,120,130,140,150,160,170,180,190,200,
		215,230,250,270,290,310,13],
    cycle : function (Ta) {
        Core.startRecording();
        data.rt.clear();

        Core.timedPrint("About to change cryo T to " + Ta.toFixed(2) +"K ...")
        wait(60*1000);

        Core.timedPrint("Tc = " + Ta.toFixed(2) +"K");
        TempCtrl.setCryoTs(Ta);

	wait(60*1000);

        RateMonitors.waitForStable2(Meas.maxdRdt,Meas.maxdTdt); 

	wait(60*1000);   

	Core.save("R measurement at " + Ta.toFixed(2) + "K");  
    },

    doProgram : function() {
		var Tm = Meas.Tm;
        var n = Tm.length;
        for(var i=0; i<n; i++)
        {
            Meas.cycle(Tm[i]);
        }
	}
}


