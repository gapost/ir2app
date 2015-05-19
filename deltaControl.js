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
        var nvm = dev.newDevice("nvm",gpib,7,"K2182");
        nvm.binaryDataTransfer = true;
        nvm.dualChannel = true;
        nvm.display = true;
        nvm.autoZero = true;
        nvm.nplc=1;
        nvm.lineSync=1;
        //nvm.delay=0.02
        //nvm.nplc = 5
        //nvm.analogFilter = true
        var R = nvm.ch1.newJob("R","DataChannel");
        R.signalName = "Sample Resistance 1-3";
        R.unit = "mOhm";
        R.averaging = "Delta";
        R.depth = 13;
        R.parserExpression = "abs(x)";
        R.format = "f";
        R.precision = 4;
        var T = R.newJob("T","Interpolator");
        with(T) {
            signalName = "Sample Temperature from R";
            unit = "K";
            type = "CubicSpline";
            fromTextFile("tables/S_R_T.dat");
            range = [1,1000];
        }
        var V = nvm.ch1.newJob("V","DataChannel");
        V.signalName = "Contact Voltage 1-3";
        V.unit = "Volts";
        V.averaging = "Running";
        V.depth = 2;
        R = nvm.ch2.newJob("R","DataChannel");
        R.signalName = "Sample Resistance 2-3";
        R.unit = "mOhm";
        R.averaging = "Delta";
        R.depth = 13;
        R.parserExpression = "abs(x)";
        R.format = "f";
        R.precision = 4;
        V = nvm.ch2.newJob("V","DataChannel");
        V.signalName = "Contact Voltage 2-3";
        V.unit = "Volts";
        V.averaging = "Running";
        V.depth = 2;

        var ratio = nvm.newJob("ratio","BinaryOp");
        ratio.setLeftChannel(nvm.ch2.R);
        ratio.setRightChannel(nvm.ch1.R);
        ratio.op = "Div";
        ratio.multiplier=-200;
        ratio.offset=+100;
        ratio.signalName = "100 (R12 - R23) / R13"
        ratio.units = "%";
        ratio.format = "f";
        ratio.precision = 2;


        // obsolete : to dismiss
        with(nvm)
        {
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

        nvm.on();




        var src = dev.newDevice("src",gpib,12,"K6220");
        src.floating = true;
        src.display = true;
        src.delay = 0.001;
        src.on();
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

    showChannels : function(on) {
        var Tr = dev.nvm.ch1.R.T;
        if (on) Tr.show();
        else Tr.hide();
    },

    startImpl : function (srcCurrent) {
        with(dev)
        {
            //if (tcs1.autoMode || tcs2.autoMode) return;

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
            //if (tcs1.autoMode || tcs2.autoMode) return;
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

