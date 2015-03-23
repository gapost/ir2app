/* Create auxiliary control functions

   Created 9/2/2015 by GA

   Creates a DAQmx Task to measure 2 coltages
   connected to NI PCI 6221 card

   27/2/2015, GA

   Added z-Axis control
*/

var Aux = {
    createAxis : function() {
        print("Creating Z-Axis controls ...")
        with(dev) {
            newInterface("modbus","MODBUS-TCP")
            modbus.timeout = 300 // ms
            modbus.host = "100.100.100.5"
            modbus.port = 502
            modbus.open()

            newDevice("z",modbus,0,"Axis")
            with (z)
            {
                limitUp = 2000
                limitDown = -50000
                with(ch1) {
                    signalName = "Z-Axis position"
                    unit = "Steps"
                }

                on();
                arm();
            }

            print("Current z-axis pos = " + z.pos)
        }
        figs.newWidgetPane("axisCtrl","./ir2app/ui/axiscontrol.ui");
        with(figs.axisCtrl)
        {
            setTitle("Z-Axis Control")

            var ui = widget();

            // Run/Stop
            //btn = ui.findChild("Run");
            //btn.toggled.connect(startSampleCtrl);

            // position radio button
            var btn1 = ui.findChild("rbMetalTarget");;
            var btn2 = ui.findChild("rbGlass");;
            var btn3 = ui.findChild("rbSample");;
            var zpos = dev.z.pos;
            if (zpos===0) btn3.checked = 1;
            else if (zpos===-21600) btn2.checked = 1;
            else if (zpos===-43200) btn1.checked = 1;

            btn1.toggled.connect(this.selectZpos);
            btn2.toggled.connect(this.selectZpos);

            // position indicator
            bind(dev.z.ch1,ui.findChild("edtPosition"));
        }
    },
    selectZpos : function() {
        //print("select called ...")
        var ui=figs.axisCtrl.widget();
        var btn = ui.findChild("rbMetalTarget");
        if (btn.checked) {
            //print("rbMetalTarget is 1 ...")
            dev.z.setPos = -43200;
            return;
        }
        btn = ui.findChild("rbGlass");
        if (btn.checked) {
            //print("rbGlass is 1 ...")
            dev.z.setPos = -21600;
            return;
        }
        btn = ui.findChild("rbSample");
        if (btn.checked) {
            //print("rbSample is 1 ...")
            dev.z.setPos = 0;
            return;
        }
    },
    create : function () {
        var loop = jobs.t.auxLoop;
        var dataBuffer = jobs.buff;

        this.createAxis();

        print("Creating pressure measurement channels ...")
        dev.newNI6221("ni","/dev/comedi0");
        dev.ni.newAnalogInput("ai");
        dev.ni.ai.addChannel(0,"COMMON");
        dev.ni.ai.addChannel(1,"COMMON");
        with(dev.ni.ai.ch1)
        {
            signalName = "Low Vacuum Gauge"
            unit = "mbar"
            parserExpression = "10^((x-6.143)/1.286)";
            format = "E";
            precision = 1;
        }
        with(dev.ni.ai.ch2)
        {
            signalName = "High Vacuum Gauge"
            unit = "mbar"
            parserExpression = "10^((x-12.66)/1.33)";
            format = "E";
            precision = 1;
        }
        dev.ni.open();
        dev.ni.ai.on();
        dev.ni.ai.arm();

        dataBuffer.addChannel(dev.ni.ai.ch1);
        dataBuffer.addChannel(dev.ni.ai.ch2);

        loop.commit(dev.ni.ai);
        loop.commit(dev.z);


        with(data.rt)
        {
            newVector(["Plow", "Phigh"])
        }
        with(data.buff)
        {
            newVector(["Plow", "Phigh"])
        }
    },

    showChannels : function (on)
    {
        with(dev.ni.ai)
        {
            if (on)
            {
                ch1.show()
                ch2.show()
            }
            else
            {
                ch1.hide()
                ch2.hide()
            }
        }
        if (on) dev.z.ch1.show();
        else dev.z.ch1.hide();
    },

    start : function(on) {
        var loop =  jobs.t.auxLoop;
        if (on) loop.arm();
        else loop.disarm();
    }
}


