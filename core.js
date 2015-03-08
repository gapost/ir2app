var Core = {

    // Create all objects
    create : function(loopPeriod,measDelay) {
        print("Creating Main Aqcuisition Loop ...")
        with (jobs) {
            newTimer("t",loopPeriod)
            with (t) {
                newJob("clock","TimeChannel")
                newDelayLoop("deltaLoop",1)
                newDelayLoop("tempCtrlLoop",1)
                newDelayLoop("auxLoop",measDelay)
                newDelayLoop("measLoop",measDelay) // 1 meas per s
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
        print("Creating Data Buffers ...")
        with (data) {
            newDataFolder("rt");
            rt.vectorType = "Circular";
            rt.newVector("t");
            rt.t.time=true;
            rt.setSourceBuffer(jobs.buff);
            rt.setCapacity(Math.round(3*60*1000/loopPeriod/measDelay)); // 3 min buffer
            newDataFolder("buff");
            buff.vectorType = "Open";
            buff.newVector("t");
            buff.t.time=true;
            buff.setCapacity(Math.round(10*60*1000/loopPeriod/measDelay)); // 10 min
        }
        print("Creating Figures ...")
        with(figs)
        {
            newFigurePane("rt",3,2);
            rt.setTitle("Real Time Data");
            newFigurePane("buff",3,2);
            buff.setTitle("Buffered Data");
        }
        figs.newWidgetPane("mainCtrl","./ir2app/ui/main.ui");
        with(figs.mainCtrl)
        {
            setTitle("Main Loop Control")

            ui = widget();

            // Run/Stop
            runButton = ui.findChild("Run");
            runButton.toggled.connect(this.start);
            //runButton["clicked(bool)"].connect(this.start);
            bind(jobs.t,"armed",runButton,true);

            bind(jobs.t.clock,ui.findChild("Clock"));
        }
        print("Creating GPIB interface ...")
        with(dev) {
            // gpib
            newInterface("gpib","GPIB")
            gpib.timeout = 1000 // ms
            gpib.open()
        }
    },

    setBufferCap : function() {
        var loopPeriod = jobs.t.period;
        var measDelay = jobs.t.measLoop.delay;
        data.rt.setCapacity(Math.round(3*60*1000/loopPeriod/measDelay)); // 3 min buffer
        data.buff.setCapacity(Math.round(10*60*1000/loopPeriod/measDelay)); // 10 min
    },

    // start the main loop
    start : function(on) {
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
    },

    saveWindow : function() {
        saveWindowState("./ir2app/windowState.dat");
    },
    restoreWindow : function() {
        restoreWindowState("./ir2app/windowState.dat");
    },
    startRecording : function ()
    {
        with(data.buff)
        {
            clear()
            setSourceBuffer(jobs.buff)
        }
    },
    stopRecording : function ()
    {
        data.buff.setSourceBuffer()
    },
    save : function (comment)
    {
        var num = Core.fileAutoNumber();
        var fname = "data/" + num + ".h5";
        h5write(fname,comment)
        print("Saved data on file " + fname);
    },
    fileAutoNumber : function ()
    {
        var i = textLoad("data/_autonumber");
        i++;
        textSave(i.toString(),"data/_autonumber");
        if (i<1000) return "0"+i.toString();
        else return i.toString();
    },
    checkStability : function (maxdRdt) {
        var dRdt = jobs.dRdt.value();
        if (Math.abs(dRdt)>maxdRdt) return false;
        else return true;
    },
    waitForStable : function (maxdRdt) {
        //wait for stabilization. Check every 30"
        var i = 0;
        while(!Core.checkStability(maxdRdt))
        {
            var dRdt = jobs.dRdt.value();
            Core.timedPrint("Waiting to stabilize. dR/dt = " + dRdt.toExponential(2) + " . Limit = " + maxdRdt.toExponential(2));
            wait(30000);
        }
    },
    timedPrint : function (msg) {
        var Dt = new Date();
        print(Dt.toLocaleTimeString() + ". " + msg)

    }

}






