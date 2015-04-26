var IrradCtrl = {
    maxdRdt : 8e-5,

    cycle : function (irradTime) {

        // start recording signals into buffer
        Core.startRecording();

        // clear the real-time buffer
        data.rt.clear();

        Core.timedPrint("About to start irradiation for " + irradTime +" min ...");

        wait(60*1000); // 1 min to record starting resistance value

        var R0 = data.rt.R13.mean(); // start resistance


        Core.timedPrint("Beam on ...")
        IrradCtrl.beamOn(1);
        wait(irradTime*60*1000); // irradTime in min

        IrradCtrl.beamOn(0);
        Core.timedPrint("Beam off ...")
        wait(60000)

        RateMonitors.waitForStable(IrradCtrl.maxdRdt);
        Core.timedPrint("Stable!")

        // clear the real-time buffer
        data.rt.clear();

        Core.timedPrint("Measuring for 1 minute")
        wait(60000);

        // save the buffer
        Core.save("Beam On for " + irradTime +  " min at Low Temperature");

        var R1 = data.rt.R13.mean();
        print("R0 = " + R0.toFixed(4))
        print("R1 = " + R1.toFixed(4))
        R1 = R1-R0;
        print("DR = " + R1.toFixed(4))


        //setR15offset(8.51365+(R1-8.5596));	// correct the value of R15 for the change in R

    },

    createDAQmxChannels : function() {
        var loop = jobs.t.auxLoop;
        var loopPeriod = jobs.t.period * loop.delay;
        with(dev)
        {
            newDAQmxTask("beamCounter");
            with (beamCounter) {
                signalName = "Beam Counts"
                unit = "Cnts"
                addCountEdgesChannel("Dev1/ctr0");

                with (ch1)
                {
                    newJob("Ib","DataChannel")
                    with(Ib)
                    {
                        signalName = "Average Beam Current"
                        unit = "% full scale"
                        depth = Math.round(5*1000/loopPeriod) // 5 s averaging
                        averaging = "Running"
                        multiplier = (1000/loopPeriod)
                        format = "f";
                        precision = 1;
                    }
                }

            }
            beamCounter.on();
            beamCounter.arm();

            newDAQmxTask("beamCap");
            with (beamCap) {
                signalName = "Beam Cap Dig. Out"
                addDigitalOutputChannel("Dev1/port0/line0");
            }
            beamCap.on();
        }
        loop.commit(dev.beamCounter);
    },

    createComediChannels : function() {
        var loop = jobs.t.auxLoop;
        var loopPeriod = jobs.t.period * loop.delay;

        if (!dev.ni) dev.newNI6221("ni","/dev/comedi0");

        var ni = dev.ni;
        var ctr = ni.newCounter("beamCounter",0);
        ctr.addChannel(0);
        var ctrChannel = ctr.ch1;
        ctrChannel.signalName = "Beam Counts";
        ctrChannel.unit = "Cnts";
        var Ib = ctrChannel.newJob("Ib","DataChannel");
        Ib.signalName = "Average Beam Current";
        Ib.unit = "% full scale";
        Ib.depth = Math.round(5*1000/loopPeriod); // 5 s averaging
        Ib.averaging = "Running";
        Ib.multiplier = (1000/loopPeriod);
        Ib.format = "f";
        Ib.precision = 1;


            ctr.on();
            ctr.arm();

        var beamCap = ni.newDigitalOutput("beamCap");
        beamCap.addChannel(0);
        beamCap.on();

        loop.commit(dev.ni.beamCounter);
    },

    create : function () {
        var dataBuffer = jobs.buff;

        var ctrChannel, ibChannel;
        if (ispc()) {
            IrradCtrl.createDAQmxChannels();
            ctrChannel = dev.beamCounter.ch1;
            ibChannel = dev.beamCounter.ch1.Ib;
        }
        else {
            IrradCtrl.createComediChannels();
            ctrChannel = dev.ni.beamCounter.ch1;
            ibChannel = dev.ni.beamCounter.ch1.Ib;
        }

        dataBuffer.addChannel(ctrChannel);
        dataBuffer.addChannel(ibChannel);

        with(data.rt)
        {
            newVector(["Icnts", "Ib"])
        }
        with(data.buff)
        {
            newVector(["Icnts", "Ib"])
        }

        with(figs)
        {
            newFigurePane("rtBeam");
            rtBeam.setTitle("Real Time Beam Current");
            newFigurePane("buffBeam");
            buffBeam.setTitle("Buffered Beam Current");
        }

        this.createFigs(figs.rtBeam,  data.rt)
        this.createFigs(figs.buffBeam,data.buff)

        figs.newWidgetPane("irradCtrl","./ir2app/ui/irradControl.ui")
        with(figs.irradCtrl)
        {
            setTitle("Ion beam Ctrl")

            var ui = widget();

            //bind(dev.beamCap.ch1,"state",ui.findChild("beamOn"))
            // Beam On/Off
            var runButton = ui.findChild("beamOn");
            runButton.clicked.connect(IrradCtrl.beamOnPressed);


            bind(ctrChannel,ui.findChild("Icnts"));
            bind(ibChannel,ui.findChild("Ib"));

        }

        var scr = jobs.newJob("html","ScriptJob");
        scr.code = textLoad("./ir2app/htmlData.js");
        scr.arm();
        t.measLoop.commit(scr);

    },

    createFigs : function (Figs,Data) {
        with(Figs)
        {
            with(Data)
            {
                with(fig1)
                {
                    plot(t,Ib);
                    title="Average Beam Current";
                    ylabel="% Full Scale";
                    timeScaleX = true;
                }
            }
        }
    },

    beamOn : function (on) {
        //print("called..." + (on ? "1" : "0"))
        var NI = ispc() ? dev : dev.ni;
        NI.beamCap.ch1.push(on ? 0 : 1);
        NI.beamCap.write();
        var ui = figs.irradCtrl.widget();
        var btOn = ui.findChild("beamOn");
        if (btOn.checked!=on) btOn.toggle(); //checked=true;
    },

    beamOnPressed : function (on) {
        //print("called..." + (on ? "1" : "0"))
        IrradCtrl.beamOn(on);
    },


    showChannels : function (on) {
        var NI = ispc() ? dev : dev.ni;

        if (on)
        {
            NI.beamCounter.ch1.show()
            NI.beamCounter.ch1.Ib.show()
        }
        else
        {
            NI.beamCounter.ch1.hide()
            NI.beamCounter.ch1.Ib.hide()
        }
    }

}
