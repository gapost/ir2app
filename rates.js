var RateMonitors = {
    create : function () {
        var integTime = 180; //sec
        var loop = jobs.t.tempCtrlLoop;
        var loopPeriod = jobs.t.period;
        var dataBuffer = jobs.buff;

        print("Creating rate monitors ...")
        with(jobs)
        {
            newJob("dTdt","LinearCorrelator");
            with (dTdt) {
                setXChannel(t.clock);
                setYChannel(dev.dmm1.ch3.T);
                multiplier=60;
                depth = Math.round(integTime*1000/loopPeriod)
                signalName = "dT/dt -Cryo"
                unit = "K/min"
                format = "e";
                precision = 1;
                arm();
            }
            loop.commit(dTdt);

            newJob("dT2dt","LinearCorrelator");
            with (dT2dt) {
                setXChannel(t.clock);
                setYChannel(dev.dmm1.ch1.T);
                multiplier=60;
                depth = Math.round(integTime*1000/loopPeriod)
                signalName = "dT/dt - Sample"
                unit = "K/min"
                format = "e";
                precision = 1;
                arm();
            }
            loop.commit(dT2dt);

            newJob("dRdt","LinearCorrelator");
            with ( dRdt ) {
                setXChannel(t.clock);
                setYChannel(dev.nvm.ch1.R);
                multiplier=60;
                depth = Math.round(integTime*1000/loopPeriod)
                signalName = "dR/dt - Sample"
                unit = "mOhm/min"
                format = "e";
                precision = 1;
                arm();
            }
            loop.commit(dRdt);

        }

    },

    checkStability : function (maxdRdt) {
        var dRdt = jobs.dRdt.value();
        if (Math.abs(dRdt)>maxdRdt) return false;
        else return true;
    },
	
    waitForStable : function (maxdRdt) {
        //wait for stabilization. Check every 30"
        var i = 0;
        while(!RateMonitors.checkStability(maxdRdt))
        {
            var dRdt = jobs.dRdt.value();
            Core.timedPrint("Waiting to stabilize. dR/dt = " + dRdt.toExponential(2) + " . Limit = " + maxdRdt.toExponential(2));
            wait(30000);
        }
    },

    checkStability2 : function (maxdRdt,maxdTdt) {
        var x = jobs.dRdt.value();
        if (Math.abs(x)>maxdRdt) return false;
        x = jobs.dTdt.value();
        if (Math.abs(x)>maxdTdt) return false;
        return true;
    },

    waitForStable2 : function (maxdRdt, maxdTdt) {
        //wait for stabilization. Check every 30"
	// check both R and cryostat T
        var i = 0;
        while(!RateMonitors.checkStability2(maxdRdt, maxdTdt))
        {
            var dRdt = jobs.dRdt.value();
	    var dTdt = jobs.dTdt.value();
            Core.timedPrint("Waiting to stabilize. dR/dt = " + dRdt.toExponential(2) 
			+ "dT/dt = " + dTdt.toExponential(2));
            wait(30000);
        }
    },
	
    showChannels : function (on) {
        with(jobs)
        {
            if (on)
            {
                dTdt.show()
                //dT2dt.show()
                dRdt.show()
            }
            else
            {
                dTdt.hide()
                //dT2dt.hide()
                dRdt.hide()
            }
        }
    }

}
