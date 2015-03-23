var Meas = {
    maxdRdt : 5e-5,
	Tm : [14,15,16,17,18,20,22,24,26,28,30,33,36,39,42,46,50,55,
		60,66,72,80,90,100,110,120,130,140,150,160,170,180,190,200,
		200,215,230,250,270,290,310];
    cycle : function (Ta) {
        Core.startRecording();
        data.rt.clear();

        Core.timedPrint("About to change cryo T to " + Ta.toFixed(2) +"K ...")
        wait(60*1000);

        Core.timedPrint("Tc = " + Ta.toFixed(2) +"K");
        TempCtrl.setCryoTs(Ta);
        RateMonitors.waitForStable(Meas.maxdRdt);     
    },
    cycleArray : function (Ta,ta,tw) {
        var n = Ta.length;
        for(var i=0; i<n; ++i)
        {
            Anneal.cycle(Ta[i],ta[i],tw[i]);
        }
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


