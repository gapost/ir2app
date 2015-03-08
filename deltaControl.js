var Delta = {

    setR15offset : function (r) {
        with(dev.nvm)
        {
            R1.offset=-r
            R2.offset=-r
        }
    },
    getR15offset : function() {
        return -1*dev.nvm.R1.offset;
    },

    setRratio : function (alpha) {
        with(dev.nvm)
        {
            R1.multiplier=2/(1+alpha)
            R2.multiplier=1/(1-alpha)
        }
    },
    getRratio : function() {
        var a = dev.nvm.R1.multiplier;
        a = 2/a-1;
        return a;
    },

    createNvm : function(alpha,R15) {
        var gpib = dev.gpib;
        print("Create nvm ...")
        with(dev)
        {
            newDevice("nvm",gpib,7,"K2182")
            with(nvm) {
                binaryDataTransfer = true;
                dualChannel = true;
                display = true
                autoZero = true
                nplc=1
                lineSync=1
                //delay=0.02
                //nplc = 5
                //analogFilter = true


                with(ch1) {
                    newJob("R","DataChannel");
                    with(R)
                    {
                        signalName = "Sample Resistance 1-3"
                        unit = "mOhm"
                        averaging = "Delta"
                        depth = 13
                        parserExpression = "abs(x)";
                        format = "f"
                        precision = 4
                    }
                    newJob("V","DataChannel");
                    with(V)
                    {
                        signalName = "Contact Voltage 1-3"
                        unit = "Volts"
                        averaging = "Running"
                        depth = 2
                    }
                }
                with(ch2) {
                    newJob("R","DataChannel");
                    with(R)
                    {
                        signalName = "Sample Resistance 2-3"
                        unit = "mOhm"
                        averaging = "Delta"
                        depth = 13
                        parserExpression = "abs(x)";
                    }
                    newJob("V","DataChannel");
                    with(V)
                    {
                        signalName = "Contact Voltage 2-3"
                        unit = "Volts"
                        averaging = "Running"
                        depth = 2
                    }
                }
                on();

                newJob("ratio","BinaryOp")
                with(ratio) {
                    setLeftChannel(nvm.ch2.R)
                    setRightChannel(nvm.ch1.R)
                    op = "Div"
                    multiplier=-200;
                    offset=+100;
                    signalName = "100 (R12 - R23) / R13"
                    units = "%"
                    format = "f"
                    precision = 2;
                }
                newJob("R1","BinaryOp")
                with(R1) {
                    setLeftChannel(nvm.ch1.R)
                    setRightChannel(nvm.ch2.R)
                    op = "Sub"
                    multiplier=2/(1+alpha)
                    offset=-R15
                    signalName = "Sample Resistance 1"
                    units = "mOhm"
                    newJob("T","Interpolator")
                    with(T) {
                        signalName = "Sample Temperature 1"
                        unit = "K"
                        type = "CubicSpline"
                        fromTextFile("tables/S_R_T.dat")
                        range = [1,1000];
                    }
                }
                newJob("R2","BinaryOp")
                with(R2) {
                    setLeftChannel(nvm.ch2.R)
                    setRightChannel(nvm.ch2.R)
                    op = "Add"
                    multiplier=1/(1-alpha)
                    offset=-R15
                    signalName = "Sample Resistance 2"
                    units = "mOhm"
                    newJob("T","Interpolator")
                    with(T) {
                        signalName = "Sample Temperature 2"
                        unit = "K"
                        type = "CubicSpline"
                        fromTextFile("tables/S_R_T.dat")
                        range = [1,1000];
                    }
                }
            }



            newDevice("src",gpib,12,"K6220")
            with(src) {
                floating = true
                display = true
                delay = 0.001;
                on();
            }
        }
    },

    create : function (alpha, R15) {

        var loop = jobs.t.deltaLoop;
        var dataBuffer = jobs.buff;

        this.createNvm(alpha,R15);

        with(loop)
        {
            commit(dev.nvm);
        }

        with(dev.nvm)
        {
            dataBuffer.addChannel(ch1.R);
            dataBuffer.addChannel(ch2.R);
            dataBuffer.addChannel(ch1.V);
            dataBuffer.addChannel(ch2.V);
            dataBuffer.addChannel(ratio);
        }
        with(data.rt)
        {
            newVector(["R13","R23","V13","V23","r"])
        }
        with(data.buff)
        {
            newVector(["R13","R23","V13","V23","r"])
        }
        this.createFigs(figs.rt,data.rt)
        this.createFigs(figs.buff,data.buff)

        figs.newWidgetPane("deltaCtrl","./ir2app/ui/deltaControl.ui");
        with(figs.deltaCtrl)
        {
            setTitle("Delta-Mode R Meas.")

            ui = widget();

            // Run/Stop
            runButton = ui.findChild("Run");
            runButton.toggled.connect(this.deltaRunPressed);

            // 1st tab
            bind(dev.nvm.ch1.R,ui.findChild("Rs"));
            bind(dev.nvm.ratio,ui.findChild("ratio"));

        }
    },

    createFigs : function (Figs,Data) {
        with(Figs)
        {
            with(Data)
            {
                with(fig3)
                {
                    plot(t,R13);
                    //plot(t,R23);
                    title="Sample Resistance";
                    ylabel="mOhm";
                    timeScaleX = true;
                }
                with(fig4)
                {
                    plot(t,r);
                    title="100 (R12 - R23) / R13";
                    timeScaleX = true;
                }
            }
        }
    },

    startImpl : function (srcCurrent) {
        with(dev)
        {
            if (tcs1.autoMode || tcs2.autoMode) return;

            jobs.t.deltaLoop.disarm();
            nvm.disarm();
            src.disarm();

            with(src)
            {
                output=0;
                current=0;
                sweep = true;
                range = srcCurrent;
                sweepList = [srcCurrent, -srcCurrent];
                sweepCount = 0;
                externalTrigger = true;
            }
            src.off();src.on();
            with(nvm)
            {
                ch1.R.multiplier = 1000/srcCurrent;
                ch2.R.multiplier = 1000/srcCurrent;
            }
            src.arm();
            wait(1000);
            nvm.arm();
            jobs.t.deltaLoop.arm();
        }
    },
    start : function (srcCurrent) {
        var ui = figs.deltaCtrl.widget();
        var Is = ui.findChild("Is");
        Is.setValue(srcCurrent);

        var btRun = ui.findChild("Run");
        btRun.checked=true;
    },
    stopImpl : function () {
        with(dev)
        {
            if (tcs1.autoMode || tcs2.autoMode) return;
            jobs.t.deltaLoop.disarm();
            nvm.disarm();
            src.disarm();
        }
    },
    stop : function () {
        var ui = figs.deltaCtrl.widget();
        var btRun = ui.findChild("Run");
        btRun.checked=false;
    },

    deltaRunPressed : function (on) {
        if (on)
        {
            ui = figs.deltaCtrl.widget();
            Is = ui.findChild("Is");
            Delta.startImpl(Is.value);
        }
        else
        {
            Delta.stopImpl();
        }
    }

};

