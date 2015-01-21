function createRateMonitors(loop,loopPeriod,dataBuffer)
{
	var integTime = 180; //sec
	
	with(jobs)
	{
		newJob("dTdt","LinearCorrelator");
		dTdt.setXChannel(t.clock);
		dTdt.setYChannel(dev.dmm1.ch3.T);
		dTdt.multiplier=60;
		dTdt.depth = Math.round(integTime*1000/loopPeriod)
		dTdt.signalName = "dT/dt -Cryo"
		dTdt.unit = "K/min"
		dTdt.arm();
		loop.commit(dTdt);
		
		newJob("dT2dt","LinearCorrelator");
		dT2dt.setXChannel(t.clock);
		dT2dt.setYChannel(dev.dmm1.ch1.T);
		dT2dt.multiplier=60;
		dT2dt.depth = Math.round(integTime*1000/loopPeriod)
		dT2dt.signalName = "dT/dt - Sample"
		dT2dt.unit = "K/min"
		dT2dt.arm();
		loop.commit(dT2dt);
		
		newJob("dRdt","LinearCorrelator");
		dRdt.setXChannel(t.clock);
		dRdt.setYChannel(dev.nvm.ch1.R);
		dRdt.multiplier=60;
		dRdt.depth = Math.round(integTime*1000/loopPeriod)
		dRdt.signalName = "dR/dt - Sample"
		dRdt.unit = "mOhm/min"
		dRdt.arm();
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
			dT2dt.show()
			dRdt.show()
		}
		else
		{
			dTdt.hide()
			dT2dt.hide()
			dRdt.hide()
		}
	}
}