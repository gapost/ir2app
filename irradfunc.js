exec("./ir2ap/include.js")

function checkStability(maxdRdt)
{
	var dRdt = jobs.dRdt.value();
	
	print("dRdt="+dRdt.toExponential(2));
	
	if (Math.abs(dRdt)>maxdRdt) return false;
	
	return true;
}

function waitForStable(maxdRdt)
{
		//wait for stabilization. Check every 10 s
		var i = 0;
		while(!checkStability(maxdRdt)) 
		{
			wait(30000);
			i = i+1;
			var tt=i/2;
			print("waiting " + tt.toFixed(1) + " min to stabilize ...")
		}
}


function irradCycle(irradTime)
{
	startRecording();
	print("Start Recording")
	
	// clear the real-time buffer
	data.rt.clear();

	
	wait(60*1000); // 1 min to record starting resistance value
	
	var R0 = data.rt.R13.mean(); // start resistance
	
	
	beamOn();
	print("Beam On for " + irradTime + " min")
	wait(irradTime*60*1000); // irradTime in min
	
	beamOff();
	print("Beam Off")
	wait(60000)
	
	waitForStable(2e-5) 
	print("Stable!")
	
	// clear the real-time buffer
	data.rt.clear();
	
	print("Measuring for 1 minute")
	wait(60000);
	
	// save the buffer
	save("Beam On for " + irradTime +  " min at Low Temperature");
	
	var R1 = data.rt.R13.mean();
	print("R0 = " + R0.toFixed(4))
	print("R1 = " + R1.toFixed(4))
	R1 = R1-R0;
	print("DR = " + R1.toFixed(4))

    
    setR15offset(8.51365+(R1-8.5596));	// correct the value of R15 for the change in R
}
