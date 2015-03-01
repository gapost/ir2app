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
