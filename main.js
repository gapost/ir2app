loopPeriod = 333; // ms
irradiation = false;
measDelay = 3;

exec("./ir2app/include.js")


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
    gpib.timeout = 1000 // ms
	gpib.open()
}

// creating all systems
createDeltaControl(dev.gpib,jobs.t.deltaLoop,jobs.buff)
createTempControl(dev.gpib,jobs.t.cryoLoop,loopPeriod,jobs.buff)
//createIrradiationControl(jobs.t.measLoop,jobs.buff,loopPeriod*measDelay) 
createRateMonitors(jobs.t.cryoLoop,loopPeriod,jobs.buff);
createPressureIndicator(jobs.t.measLoop,jobs.buff);

// set a 3 min real-time buffer
data.rt.setCapacity(Math.round(3*60*1000/loopPeriod/measDelay));
// set a 10 min  buffer cap
data.buff.setCapacity(Math.round(10*60*1000/loopPeriod/measDelay));

function startMainLoop(on)
{
	if (on)
	{
		jobs.buff.arm();
		jobs.t.arm();
	}
	else
	{
		jobs.buff.disarm();
		jobs.t.disarm();
	}
}

figs.newWidgetPane("mainCtrl","./ir2app/ui/main.ui");
with(figs.mainCtrl)
{
	setTitle("Main Loop Control")
		
	ui = widget();
		
	// Run/Stop
	runButton = ui.findChild("Run");
	runButton.toggled.connect(startMainLoop);
	bind(jobs.t,"armed",runButton,true);
	
	bind(jobs.t.clock,ui.findChild("Clock"));
	bind(jobs.t.cryoLoop,"delay",ui.findChild("cryoDelay"));
	bind(jobs.t.deltaLoop,"delay",ui.findChild("deltaDelay"));
	//bind(jobs.t.sampleLoop,"delay",ui.findChild("sampleDelay"));
	bind(jobs.t.measLoop,"delay",ui.findChild("measDelay"));
}

jobs.t.clock.show()
showTemperatureChannels(1);
showRateChannels(1);
showPressureChannels(1);

restoreWindowState("./ir2app/windowState.dat");


startMainLoop(true);



with (jobs) {
	
	dev.dmm1.write(":disp:text:stat 1")
	newJob("scr","ScriptJob")
	scr.code  = "var msg = \"T0  \" + dev.dmm1.ch3.T.value().toFixed(2);\n"
	scr.code += "dev.dmm1.write(\":disp:text:data '\"+msg+\"K'\")";
	scr.arm();
	with (t.slow) {		
		commit(scr);		
	}
}








