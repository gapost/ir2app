function createTempControl(gpib,loop,loopPeriod,dataBuffer)
{
	var tmout = 1000; // 1s timeout
	var Rheater1 = 0.08375
	var Rheater2 = 0.0811
	var tcChannelDepth = 6;

	dev.newDevice("dmm1",gpib,16,"K2000")

	with(dev.dmm1) {
		binaryDataTransfer = true;
		func = "VoltDC"
		range = 0
		binary = true
		display=true
		nplc=1
	
		with(ch1)
		{
			signalName = "TC1 Voltage"
			unit = "mV"
			multiplier = 1000
			//offset = -5.829 // V of type K at reference temp To=77 K
			depth = tcChannelDepth
			averaging = "Running"
			
			newJob("T","Interpolator")
			with(T) {
				signalName = "Sample Temperature 1"
				unit = "K"
				type = "CubicSpline"
                fromTextFile("tables/TC1_V_T.dat")
                format = "f"
                precision = 2
			}
		}
		with(ch2)
		{
			signalName = "TC2 Voltage"
			unit = "mV"
			multiplier = 1000
			//offset = -5.829 // V of type K at reference temp To=77 K
			depth = tcChannelDepth
			averaging = "Running"

			newJob("T","Interpolator")
			with(T) {
				signalName = "Sample Temperature 1"
				unit = "K"
				type = "CubicSpline"
                fromTextFile("tables/TC2_V_T.dat")
                format = "f"
                precision = 2;
			}
		}
		with(ch3)
		{
			signalName = "Diode Voltage"
			unit = "uV"
			multiplier = 1e5
			
			depth = 9
			averaging = "Running"
			
			newJob("T","Interpolator")
			with(T)
			{
				offset = 0
				signalName = "Cryo Diode Temperature"
				unit = "K"
				type = "CubicSpline"
				range = [1.5,450]
				fromTextFile("tables/Si19149R.dat")
                format = "f"
                precision = 2;
			}
		}
		
		scanRange = [1,3]
		scan = true 
		
		newJob("T1","DataChannel")
		with(T1) {
			setInputChannel(dev.nvm.R1.T)
		}	
		newJob("T2","DataChannel")
		with(T2) {
			setInputChannel(dev.nvm.R2.T)
		}	
		
		on();
	}
	
	with(dev)
	{
		{
			print("Creating Sample heaters ...")
			newInterface("tcp2","TCPIP")
			with(tcp2)
			{
				timeout = tmout // ms
				host = "100.100.100.4"
				port = 9221
				open()
			}
			newInterface("tcp3","TCPIP")
			with(tcp3)
			{
				timeout = tmout // ms
				host = "100.100.100.4"
				port = 9221
				open()
			}
			newDevice("cpx1",tcp2,0,"TTi")
			with(cpx1)
			{
				currentLimit = 4
				voltageLimit = 4
				powerLimit = 4
				mode = "ConstantCurrent" //"ConstantPower"
				load = Rheater1
				dImax = 0.1
			}
			newDevice("cpx2",tcp3,0,"TTi")
			with(cpx2)
			{
				currentLimit = 4
				voltageLimit = 4
				powerLimit = 4
				mode = "ConstantCurrent" //"ConstantPower"
				load = Rheater2
				dImax = 0.1
				outputNumber = 2;
			}
			
			
			newTemperatureController("tcs1",dev.dmm1.T1)
			with(tcs1) {

				maxPower = 4;
				samplingPeriod = loopPeriod/1000; // sec
				setPoint = 1;
				automode = false

				// pid parameters
				gain=0.002
				Ti=6
				Td=0
				beta=1
				Tr=6
				Nd=5

				// autotuner
				relayStep = 0.2; // Watt
				relayThreshold = 0.1 // dT in K
				relayIterations = 2;
			}
			tcs1.on()
			cpx1.setProgramingInput(tcs1.W)

			newTemperatureController("tcs2",dev.dmm1.T2)
			with(tcs2) {

				maxPower = 4;
				samplingPeriod = loopPeriod/1000; // sec
				setPoint = 1;
				automode = false

				// pid parameters
				gain=0.002
				Ti=6
				Td=0
				beta=1
				Tr=6
				Nd=5

				// autotuner
				relayStep = 0.2; // Watt
				relayThreshold = 0.1 // dT in K
				relayIterations = 2;
			}
			tcs2.on()
			cpx2.setProgramingInput(tcs2.W)

			//loop.commit(dmm1);
			//loop.commit(tcs1);
			//loop.commit(tcs2);
			//loop.commit(cpx1);
			//loop.commit(cpx2);
			
			
		}	

	}
	
	with(dev)
	{
		newInterface("tcp1","TCPIP")
		with(tcp1)
		{
			timeout = tmout // ms
			host = "100.100.100.3"
			port = 9221
			open()
		}

		newDevice("plp",tcp1,0,"TTi")
		with(plp)
		{
			currentLimit = 1
			voltageLimit = 40
			powerLimit = 20
			mode = "ConstantVoltage" //"ConstantPower"
			load = 40 // 40 Ohm heater
			dImax = 0.01
		}
		
		newTemperatureController("tc",dmm1.ch3.T)
		with(tc) {

			maxPower = 20;
			samplingPeriod = loopPeriod/1000; // sec
			setPoint = 10;
			automode = false

			// pid parameters
            gain=0.8
			Ti=21
			Td=2.75
			b=1
			Tr=7.6
			Nd=5

			// autotuner
			relayStep = 0.2; // Watt
			relayThreshold = 0.1 // dT in K
			relayIterations = 2;
		}
		plp.setProgramingInput(tc.W);
		
	}

	with(loop)
	{
		commit(dev.dmm1);
		commit(dev.plp);
		commit(dev.tc);
		//commit(dev.dmm1);
	    commit(dev.tcs1);
	    commit(dev.tcs2);
	    commit(dev.cpx1);
	    commit(dev.cpx2);
	}
	
	
	with(dataBuffer)
	{
		addChannel(dev.dmm1.ch1);
		addChannel(dev.dmm1.ch2);
		addChannel(dev.dmm1.ch1.T);
		addChannel(dev.dmm1.ch2.T);		
		addChannel(dev.cpx1.W) // sample heater power
		addChannel(dev.cpx2.W) // sample heater power
		addChannel(dev.dmm1.ch3.T);
		addChannel(dev.plp.W);
	}

	var vectorNames =  ["V1","V2","T1","T2","Ws1","Ws2","T0","Wc"]; 
	
	data.rt.newVector(vectorNames);
	data.buff.newVector(vectorNames);
		
	createCtrlFigs(figs.rt,data.rt,false) 
	createCtrlFigs(figs.buff,data.buff,false) 
	
	createSampleControlWidget();
	createTempFigs(figs.rt,data.rt)
	createTempFigs(figs.buff,data.buff)
	
	figs.newWidgetPane("cryoCtrl","./ir2app/ui/cryoTemperatureControl.ui")
	with(figs.cryoCtrl)
	{
		setTitle("Cryostat Control")
		
		ui = widget();
		
		// Run/Stop
		runButton = ui.findChild("Run");
        runButton.toggled.connect(startTempCtrl);
				
		// 1st tab
		bind(dev.dmm1.ch3.T,ui.findChild("T"));
		bind(dev.tc,"setPoint",ui.findChild("setPoint"));
		bind(dev.tc,"autoMode",ui.findChild("autoMode"));
		bind(dev.plp.W,ui.findChild("W"));
		bind(dev.tc,"power",ui.findChild("setW"));
		//bind(dev.dmm2.ch3.P,ui.findChild("P"));
		
		// 2nd tab
		bind(dev.tc,"gain",ui.findChild("gain"));
		bind(dev.tc,"Ti",ui.findChild("Ti"));
		bind(dev.tc,"Td",ui.findChild("Td"));
		bind(dev.tc,"Tr",ui.findChild("Tr"));
		bind(dev.tc,"beta",ui.findChild("beta"));
		bind(dev.tc,"maxPower",ui.findChild("maxPower"));

		// 3rd tab
		bind(dev.tc,"autoTune",ui.findChild("autoTune"));
		bind(dev.tc,"relayStep",ui.findChild("relayStep"));
		bind(dev.tc,"relayThreshold",ui.findChild("relayThreshold"));
		bind(dev.tc,"Kc",ui.findChild("Kc"),true);
		bind(dev.tc,"Tc",ui.findChild("Tc"),true);

	}	

		
		
		
}		
function createSampleControlWidget()
{
	figs.newWidgetPane("sampleCtrl","./ir2app/ui/sampleControl.ui");
	with(figs.sampleCtrl)
	{
		setTitle("Sample T Control")
		
		ui = widget();
		
		// Run/Stop
        //btn = ui.findChild("Run");
        //btn.toggled.connect(startSampleCtrl);
	
		// select input
		btn = ui.findChild("selectTCinput");
		btn.toggled.connect(selectTCinput);
		
				
		// 1st tab
		bind(dev.dmm1.T1,ui.findChild("T1"));
		bind(dev.dmm1.T2,ui.findChild("T2"));
		btn = ui.findChild("setPoint");
		btn['valueChanged(double)'].connect(setSampleTs);
		btn = ui.findChild("autoMode");
		btn.toggled.connect(setSampleAuto);
		bind(dev.cpx1.W,ui.findChild("W1"));
		bind(dev.cpx2.W,ui.findChild("W2"));
		
		
		// 2nd tab
		bind(dev.tcs1,"gain",ui.findChild("gain1"));
		bind(dev.tcs1,"Ti",ui.findChild("Ti1"));
		bind(dev.tcs1,"Td",ui.findChild("Td1"));
		bind(dev.tcs1,"Tr",ui.findChild("Tr1"));
		bind(dev.tcs1,"beta",ui.findChild("beta1"));
		bind(dev.tcs1,"maxPower",ui.findChild("maxPower1"));
		// 3rd tab
		bind(dev.tcs2,"gain",ui.findChild("gain2"));
		bind(dev.tcs2,"Ti",ui.findChild("Ti2"));
		bind(dev.tcs2,"Td",ui.findChild("Td2"));
		bind(dev.tcs2,"Tr",ui.findChild("Tr2"));
		bind(dev.tcs2,"beta",ui.findChild("beta2"));
		bind(dev.tcs2,"maxPower",ui.findChild("maxPower2"));

		// 3rd tab
		bind(dev.tcs1,"Kc",ui.findChild("Kc1"),true);
		bind(dev.tcs1,"Tc",ui.findChild("Tc1"),true);
		bind(dev.tcs2,"Kc",ui.findChild("Kc2"),true);
		bind(dev.tcs2,"Tc",ui.findChild("Tc2"),true);

	}
}
		
function createTempFigs(Figs,Data)
{
	with(Figs)
	{
		with(Data)
		{
			with(fig1)
			{
				plot(t,T0);
				title="Cryo Temperature";
				ylabel="T0";
				timeScaleX = true;
			}
			with(fig5)
			{
				plot(t,Wc);
				title= "Cryo Heater";
				ylabel="Watt";
				timeScaleX = true;
			}
		}
	}		
}

function createCtrlFigs(Figs,Data,irradMode)
{
	with(Figs)
	{
		with(Data)
		{
			with(fig2)
			{
				plot(t,T1);
				plot(t,T2);
				title="Sample Temperature";
				ylabel="K";
				timeScaleX = true;
			}
			with(fig6)
			{
				plot(t,Ws1);
				plot(t,Ws2);
				title="Sample Heaters";
				ylabel="Watt";
				timeScaleX = true;
			}
		}
	}
}
function setSampleTs(Ts)
{
	with(dev)
	{
		tcs1.setPoint = Ts;
		tcs2.setPoint = Ts;
	}
	var ui=figs.sampleCtrl.widget();
	var btn = ui.findChild("setPoint");
	btn.value = Ts;
	
}

function startTempCtrl(on)
{
	with(dev)
	{
		if (on)
		{
            jobs.t.cryoLoop.disarm();
			if (tcs1.armed)
			{
				tcs1.disarm();
				tcs1.off();
			}
			if (tcs2.armed)
			{
				tcs2.disarm();
				tcs2.off();
			}
            if (tc.armed)
            {
                tc.disarm();
                tc.off();
            }
            if (cpx1.armed)
			{
				cpx1.disarm();
				cpx1.off();
			}
			if (cpx2.armed)
			{
				cpx2.disarm();
				cpx2.off();
			}
            if (plp.armed)
            {
                plp.disarm();
                plp.off();
            }
            if (dmm1.armed)
			{
				dmm1.disarm();
				dmm1.off();
			}
			dmm1.on();
			cpx1.on();
			cpx2.on();
            plp.on();
			tcs1.on();
			tcs2.on();
            tc.on();
			dmm1.arm();
			cpx1.arm();
			cpx2.arm();
            plp.arm();
			tcs1.arm();
			tcs2.arm();
            tc.arm();
            jobs.t.cryoLoop.arm();
		}
		else
		{
            jobs.t.cryoLoop.disarm();
			tcs1.disarm();
			tcs1.off();
			tcs2.disarm();
			tcs2.off();
            tc.disarm();
            tc.off();
			cpx1.disarm();
			cpx1.off();
			cpx2.disarm();
			cpx2.off();
            plp.disarm();
            plp.off();
			dmm1.disarm();
			dmm1.off();
		}
	}

    with(figs.cryoCtrl)
	{
		ui = widget();
		runButton = ui.findChild("Run");
		runButton.setChecked(dev.dmm1.armed);
	}

}

function selectTCinput(on)
{
	if (dev.tcs1.autoMode || dev.tcs2.autoMode) return; 
	
	var ui=figs.sampleCtrl.widget();
	
	
	if (on)
	{
		with(dev.dmm1)
		{
			T1.setInputChannel(dev.dmm1.ch1.T);
			T2.setInputChannel(dev.dmm1.ch2.T);
		}
		var btn = ui.findChild("selectTCinput");
		btn.setChecked(1);
	}
	else
	{
		with(dev.dmm1)
		{
			T1.setInputChannel(dev.nvm.R1.T);
			T2.setInputChannel(dev.nvm.R2.T);
		}
		var btn = ui.findChild("selectTRinput");
		btn.setChecked(1);
	}		
}

function setSampleAuto(on)
{
	if (on)
	{
		with(dev)
		{
			tcs1.autoMode=true;
			tcs2.autoMode=true;
		}
	}
	else
	{
		with(dev)
		{
			tcs1.autoMode=false;
			tcs2.autoMode=false;
		}
	}
	var ui=figs.sampleCtrl.widget();
	var btn = ui.findChild("autoMode");
	btn.setChecked(on);
}

function showTemperatureChannels(on)
{
	with(dev)
	{
		if (on) 
		{
			dmm1.ch3.T.show()
			dmm1.ch1.T.show()
			dmm1.ch2.T.show()
            /*dev.nvm.R1.show()
			dev.nvm.R2.show()
			dev.nvm.R1.T.show()
            dev.nvm.R2.T.show()*/
		}
		else
		{
			dmm1.ch3.T.hide()
			dmm1.ch1.T.hide()
			dmm1.ch2.T.hide()
            /*dev.nvm.R1.hide()
			dev.nvm.R2.hide()
			dev.nvm.R1.T.hide()
            dev.nvm.R2.T.hide()*/
		}
	}
}








		
		
		
		
		
		





