function createIrradiationControl(loop,dataBuffer,loopPeriod)
{
	with(dev)
	{
		newInterface("pci6602","PCI6602",1)
		pci6602.newCounter("ctr0",0);
		pci6602.ctr0.filterSource(0)
		with(pci6602.ctr0.ch1)
		{
			signalName = "Beam Counts"
			unit = "Cnts"

			newJob("Ib","DataChannel")
			with(Ib)
			{
				signalName = "Average Beam Current"
				unit = "% full scale"
				depth = Math.round(2*1000/loopPeriod) // 2 s averaging
				averaging = "Running"
				multiplier = (1000/loopPeriod)
			}
		}
		pci6602.newDio("dio0",0);

		pci6602.open()
		pci6602.ctr0.on()
		pci6602.ctr0.arm()

		pci6602.dio0.input = false
		pci6602.dio0.on()
	}
	
	dataBuffer.addChannel(dev.pci6602.ctr0.ch1);
	dataBuffer.addChannel(dev.pci6602.ctr0.ch1.Ib);
	
	loop.commit(dev.pci6602.ctr0);
	
	
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
	
	createIrradFigs(figs.rtBeam,  data.rt)
	createIrradFigs(figs.buffBeam,data.buff)
	
	figs.newWidgetPane("irradCtrl","ui/irradControl.ui")
	with(figs.irradCtrl)
	{
		setTitle("Ion beam Ctrl")
		
		ui = widget();
		
		bind(dev.pci6602.dio0,"state",ui.findChild("beamOn"))
		bind(dev.pci6602.ctr0.ch1,ui.findChild("Icnts"));
		bind(dev.pci6602.ctr0.ch1.Ib,ui.findChild("Ib"));

	}
}

function createIrradFigs(Figs,Data)
{
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
}

function beamOn()
{
	dev.pci6602.dio0.state=false
}

function beamOff()
{
	dev.pci6602.dio0.state=true
}

function showIrradChannels(on)
{
	with(dev.pci6602)
	{
		if (on) 
		{
			ctr0.ch1.show()
			ctr0.ch1.Ib.show()
		}
		else
		{
			ctr0.ch1.hide()
			ctr0.ch1.Ib.hide()
		}
	}
}
