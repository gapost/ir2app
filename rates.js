function createRateMonitors(loop,loopPeriod,dataBuffer)
{
	var integTime = 180; //sec
	
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
	
}

function createRateBuffer()
{
	jobs.newJob("rateBuff","DataBuffer")
	with(jobs.rateBuff)
	{
		packetDepth = 1
		maxPackets = 100
		addChannel(jobs.t.clock)
		addChannel(jobs.dTdt)
		addChannel(jobs.dT2dt)
		addChannel(jobs.dRdt)
	}

	data.newDataFolder("rateData");
	with(data.rateData)
	{
		vectorType = "Open";
		newVector(["t","dTdt","dT2dt","dRdt"]);
		t.time=true;
		setSourceBuffer(jobs.rateBuff)
	}
	jobs.rateBuff.arm()
	
}



function destroyRateMonitors()
{
	try 
	{
		kill(jobs.dTdt)
	}
	catch(e)
	{
		print("error killing dTdt\n" + e)
	}
	try 
	{
		kill(jobs.dRdt)
	}
	catch(e)
	{
		print("error killing dRdt\n" + e)
	}
	try 
	{
		kill(jobs.dT2dt)
	}
	catch(e)
	{
		print("error killing dT2dt\n" + e)
	}

}

function showRateChannels(on)
{
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
