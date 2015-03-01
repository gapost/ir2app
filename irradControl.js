var IrradCtrl = {
    createChannels : function() {
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
    create : function () {
        var dataBuffer = jobs.buff;

        this.createChannels();

        dataBuffer.addChannel(dev.beamCounter.ch1);
        dataBuffer.addChannel(dev.beamCounter.ch1.Ib);

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


            bind(dev.beamCounter.ch1,ui.findChild("Icnts"));
            bind(dev.beamCounter.ch1.Ib,ui.findChild("Ib"));

        }
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
        dev.beamCap.ch1.push(on ? 1 : 0);
        dev.beamCap.write();
        var ui = figs.irradCtrl.widget();
        var btOn = ui.findChild("beamOn");
        if (btOn.checked!=on) btOn.toggle(); //checked=true;
    },

    beamOnPressed : function (on) {
        //print("called..." + (on ? "1" : "0"))
        IrradCtrl.beamOn(on);
    },


    showChannels : function (on)
    {
        with(dev.beamCounter)
        {
            if (on)
            {
                ch1.show()
                ch1.Ib.show()
            }
            else
            {
                ch1.hide()
                ch1.Ib.hide()
            }
        }
    }

}
