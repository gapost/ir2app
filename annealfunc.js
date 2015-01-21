exec("./include.js")

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
			wait(60000);
			i = i+1;
			var tt=i;
			print("waiting " + tt.toFixed(1) + " min to stabilize ...")
		}
}


function annealCycle(Ta,ta,tw,maxdRdt)
{
	
	startRecording();
	data.rt.clear();
	
	var Dt;
	
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". About to start anneal at " + Ta.toFixed(2) +"K ...")
	wait(60*1000);
	
	var R0 = data.rt.R13.mean();
	
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". Heating up ...")
	//dev.tcs1.Ti=15;
	//dev.tcs2.Ti=15;
	setSampleTs(Ta)
	
	wait(60*1000);
	
	
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". Annealing at " + Ta.toFixed(2) + "K, for " + ta + " min")
	wait(ta*60*1000); 
	
		
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". Cooling down... ")
	setSampleTs(26);
	//dev.tcs1.Ti=6;
	//dev.tcs2.Ti=6;

	
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". Stabilizing at base T for "+ tw + " min")	
	wait(tw*60*1000); 
	
	waitForStable(maxdRdt)
	
	Dt= new Date();	
	print(Dt.toLocaleTimeString() + ". Measuring R for 1 min")	
	data.rt.clear();
	wait(60000)
	var R1 = data.rt.R13.mean();
	var ratio = data.rt.r.mean();
	var dR = R1-R0;
	
	
	save("Anneal step. Ta=" + Ta.toFixed(2) + "K, ta=" + ta.toFixed(2) + "min");
	
	print("R0 = " + R0.toFixed(4))
	print("R1 = " + R1.toFixed(4))
	print("dR = " + dR.toExponential(2))
	
	//setR15offset(6.8766+(R1-6.92));correct the value of R15 for the change in R 6.92:value with Tcs=25K 
	setR15offset(8.51365+0.0793);//correct the value of R15 for the change in R during irradiation
	//setR15offset(5.704+(R1-(5.725+0.026)));	// correct the value of R15 for the change in R
}


function annealProgram(Ta,ta,tw,maxdRdt)
{
	var Dt;		
	var n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],tw,maxdRdt);	
	}
}

function annealLong()
{
	var Ta = new Array();
	var ta = new Array();
	var dT;
	var n;

	/*dev.tcs1.gain = 0.0015;
	dev.tcs2.gain = 0.0015;
	
	dev.tcs1.Ti = 6;
	dev.tcs2.Ti = 6;
	dev.tcs1.beta = 1;
	dev.tcs2.beta = 1;
	
	Ta=[]; ta=[]; dT=2.5;
	//for(var T=35; T<=90; T+=dT) { Ta.push(T); ta.push(dT); }
	for(var T=55; T<=90; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],5,8e-5);	
		//print(Ta[i].toFixed(1) + " " + ta[i]);
	}
	
	dev.tcs1.Ti = 8;
	dev.tcs2.Ti = 8;
	dev.tcs1.beta = 0.95;
	dev.tcs2.beta = 0.95;
	
	Ta=[]; ta=[]; dT=3;
	for(var T=93; T<=120; T+=dT) { Ta.push(T); ta.push(dT); }
	//for(var T=114; T<=120; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],5,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}

	dev.tcs1.Ti = 10;
	dev.tcs2.Ti = 10;
	dev.tcs1.beta = 0.9;
	dev.tcs2.beta = 0.9;
	
	Ta=[]; ta=[]; dT=4;
	for(var T=124; T<=160; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],7,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	

	
	dev.tcs1.Ti = 12;
	dev.tcs2.Ti = 12;
	dev.tcs1.beta = 0.85;
	dev.tcs2.beta = 0.85;
	
	Ta=[]; ta=[]; dT=5;
	for(var T=165; T<=200; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],7,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	} 

	dev.tcs1.Ti = 14;
	dev.tcs2.Ti = 14;
	dev.tcs1.beta = 0.825;
	dev.tcs2.beta = 0.825;
	
	Ta=[]; ta=[]; dT=6;
	for(var T=206; T<=260; T+=dT) { Ta.push(T); ta.push(dT); }
	//for(var T=218; T<=260; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],7,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	} 

	dev.tcs1.gain = 0.002;
	dev.tcs2.gain = 0.002;
	dev.tcs1.Ti = 14;
	dev.tcs2.Ti = 14;
	dev.tcs1.beta = 0.8;
	dev.tcs2.beta = 0.8;
	
	Ta=[]; ta=[]; dT=8;
	for(var T=268; T<=300; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],8,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	} 
	
	
	dev.tcs1.gain = 0.0022;
	dev.tcs2.gain = 0.0022;
	dev.tcs1.Ti = 14;
	dev.tcs2.Ti = 14;
	dev.tcs1.beta = 0.8;
	dev.tcs2.beta = 0.8;

	
	Ta=[]; ta=[]; dT=10;
	for(var T=310; T<=400; T+=dT) { Ta.push(T); ta.push(dT); }
	//for(var T=330; T<=400; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],15,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	
	
	
	dev.tcs1.gain = 0.0022;
	dev.tcs2.gain = 0.0022;
	dev.tcs1.Ti = 12;
	dev.tcs2.Ti = 12;
	dev.tcs1.beta = 0.8;
	dev.tcs2.beta = 0.8;

	
	Ta=[]; ta=[]; dT=15;
	//for(var T=415; T<=520; T+=dT) { Ta.push(T); ta.push(dT); }
	for(var T=475; T<=520; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],30,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	

	
	
	dev.tcs1.gain = 0.0022;
	dev.tcs2.gain = 0.0022;
	dev.tcs1.Ti = 10;
	dev.tcs2.Ti = 10;
	dev.tcs1.beta = 0.75;
	dev.tcs2.beta = 0.75;

	
	Ta=[]; ta=[]; dT=20;
	//for(var T=540; T<=700; T+=dT) { Ta.push(T); ta.push(dT); }
	for(var T=560; T<=700; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],40,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}*/
	
	
	
	dev.tcs1.gain = 0.0022;
	dev.tcs2.gain = 0.0022;
	dev.tcs1.Ti = 10;
	dev.tcs2.Ti = 10;
	dev.tcs1.beta = 0.75;
	dev.tcs2.beta = 0.75;

	
	Ta=[]; ta=[]; dT=40;
	//for(var T=720; T<=760; T+=dT) { Ta.push(T); ta.push(dT); }
	for(var T=620; T<=700; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],40,8e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	

}

function annealLongLong()
{
	var Ta = new Array();
	var ta = new Array();
	var dT;
	var n;
	
	/*dT=6;
	for(var T=206; T<=260; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],5,2e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	
	dev.tcs1.beta=0.8; dev.tcs2.beta=0.8;
	
	Ta=[]; ta=[]; dT=8;
	for(var T=268; T<=300; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],5,2e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}*/
	
	dev.tcs1.beta = 0.8;
	dev.tcs2.beta = 0.8;
	
	Ta=[]; ta=[]; dT=10;
	for(var T=400; T<=400; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],20,1e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}

	dev.tcs1.beta = 0.78;
	dev.tcs2.beta = 0.78;

	Ta=[]; ta=[]; dT=12;
	for(var T=412; T<=460; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],20,1e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	
	
	Ta=[]; ta=[]; dT=14;
	for(var T=474; T<=530; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],20,1e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}

	dev.tcs1.beta = 0.75;
	dev.tcs2.beta = 0.75;

	Ta=[]; ta=[]; dT=20;
	for(var T=550; T<=690; T+=dT) { Ta.push(T); ta.push(dT); }
	n = Ta.length;
	for(var i=0; i<n; ++i)
	{
		annealCycle(Ta[i],ta[i],20,1e-5);	
		//print(Ta[i].toFixed(0) + " " + ta[i]);
	}
	
}
