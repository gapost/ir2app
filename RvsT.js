function checkStability(Ts,dTs,maxdTdt,maxdRdt)
{
	var Tmax =  data.rt.T0.vmax();
	var Tmin =  data.rt.T0.vmin();
	var dTdt = jobs.dTdt.value();
	var dRdt = jobs.dRdt.value();
	
	print("Tmax="+Tmax.toFixed(2)+", Tmin="+Tmin.toFixed(2)+", dTdt="+dTdt.toFixed(3)+", dRdt="+dRdt.toFixed(5));
	
	if (Tmax>Ts+dTs) return false;
	if (Tmin<Ts-dTs) return false;
	if (Math.abs(dTdt)>maxdTdt) return false;
	if (Math.abs(dRdt)>maxdRdt) return false;
	
	return true;
}

function waitForStable(Ts,dTs,maxdTdt,maxdRdt)
{
		//wait for stabilization. Check every 5 s
		var i = 0;
		while(!checkStability(Ts,dTs,maxdTdt,maxdRdt)) 
		{
			wait(10000);
			i = i+1;
			var tt=i/6;
			print("waiting " + tt.toFixed(1) + " min to stabilize at " + Ts.toFixed(2))
		}
}

function RvsT(Ts)
{
	var nTs = Ts.length;
	for(var i=0; i<nTs; ++i)
	{
		print("going to " + Ts[i].toFixed(2))
		
		startRecording()
		wait(60000)
		
		dev.tc.setPoint = Ts[i];
		
		//waitForStable(Ts[i],0.015,0.002,0.00005)	
		//waitForStable(Ts[i],0.015,0.002,0.00025)	// for T>120
        waitForStable(Ts[i],0.02,0.002,0.00005) // for T>170
		print("Stable!")
		wait(60000)
		
		save("Tc = " + Ts[i])
	}
}

function RvsTCurve()
{
	
	with(dev.tc)
	{
		gain=0.8
		Ti=25
		Td=2.75
		Tr=7.6
	}
	
    //Ts = [13,14,15,16,17,18,20,22,24];
    Ts = [18,20,22,24];
    RvsT(Ts)
	

	// 30 K	
	with(dev.tc)
	{
		gain=1.0
		Ti=25
		Td=6
		Tr=11.7
	}

    Ts=[26,28,30,33,36,39,42];
    RvsT(Ts)
	
	//50 K	
	with(dev.tc)
	{
		gain=2.25
		Ti=32
		Td=8
		Tr=16
	}


    Ts=[46,50,55,60,66,72,80]; 
    RvsT(Ts)
	
	// 100 K	
	with(dev.tc)
	{
		gain=2.62
		Ti=50
		Td=12.5
		Tr=25
	}
	startDelta(0.03)
	wait(10000)
	Ts=[80,90,100,110,120,130,140,150,160,170,180,190,200];
	
	RvsT(Ts)
	
	
	// 230 K	
	with(dev.tc)
	{
		gain=2.88
		Ti=75
		Td=19
		Tr=38
	}
	startDelta(0.02)
	wait(10000)
	
	
	Ts=[200,215,230,250,270,290,310];
	RvsT(Ts)
	
	with(dev.tc)
	{
		gain=1.0
		Ti=25
		Td=2.75
		Tr=7.6
	}
	startDelta(0.05)
	wait(10000)
	
    Ts = [15,14,13,12,11,10,9];
    RvsT(Ts)

}

/*function RvsTC()
{
	
		
	with(dev.tc)
	{
		gain=2.25
		Ti=32
		Td=8
		Tr=16
	}


    Ts=[50]; 
    RvsT(Ts)
	
	// 100 K	
	with(dev.tc)
	{
		gain=2.62
		Ti=50
		Td=12.5
		Tr=25
	}
	//startDelta(0.03)
	//wait(10000)
	Ts=[100,150];
	
	RvsT(Ts)
	
	
	// 230 K	
	with(dev.tc)
	{
		gain=2.88
		Ti=75
		Td=19
		Tr=38
	}
	//startDelta(0.02)
	//wait(10000)
	
	
	Ts=[200,300,350];
	RvsT(Ts)
	
	with(dev.tc)
	{
		gain=1.0
		Ti=25
		Td=2.75
		Tr=7.6
	}
	startDelta(0.05)
	wait(10000)
	
    Ts = [15];
    RvsT(Ts)

}*/
