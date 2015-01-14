
// creating all systems
createDeltaControl(dev.gpib,jobs.t.deltaLoop,jobs.buff)
createTempControl(dev.gpib,jobs.t.cryoLoop,loopPeriod,jobs.buff)
//createIrradiationControl(jobs.t.measLoop,jobs.buff,loopPeriod*measDelay)
createRateMonitors(jobs.t.cryoLoop,loopPeriod,jobs.buff);

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

figs.newWidgetPane("mainCtrl","scripts/main.ui");
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



startMainLoop(true);
startCryo(true);
wait(1000);
startDelta(0.05);
wait(5000);
startSampleCtrl(true)

jobs.t.clock.show()
showTemperatureChannels(1);
showRateChannels(1)

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

exec("scripts/ztst.js")




