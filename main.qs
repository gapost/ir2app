loopPeriod = 333; // ms
irradiation = false;
measDelay = 3;

//exec("scripts/include.js")


print("Creating Main Aqcuisition Loop ...")
with (jobs) {

	newTimer("t",loopPeriod)
	with (t) {	
		newJob("clock","TimeChannel")
		newDelayLoop("cryoLoop",1)
		newDelayLoop("deltaLoop",1)
		//newDelayLoop("sampleLoop",1)
		newDelayLoop("slow",3)
		newDelayLoop("measLoop",measDelay)
	}
	
	newJob("buff","DataBuffer")
	with(buff)
	{
		packetDepth = 1
		maxPackets = 100
		addChannel(t.clock)
	}
	
	with (t.measLoop) {		
		commit(buff);		
	}
}

with (data) {
	newDataFolder("rt");
	rt.vectorType = "Circular";
	rt.newVector("t");
	rt.t.time=true;
	rt.setSourceBuffer(jobs.buff);
	newDataFolder("buff");
	buff.vectorType = "Open";
	buff.newVector("t");
	buff.t.time=true;
}

with(figs)
{
	newFigurePane("rt",3,2);
	rt.setTitle("Real Time Data");
	newFigurePane("buff",3,2);
	buff.setTitle("Buffered Data");
}

print("Creating GPIB interface ...")
with(dev) {
	// gpib
    newInterface("gpib","GPIB")
    gpib.timeout = 300 // ms
	gpib.open()
}

restoreWindowState("windowState.dat")
