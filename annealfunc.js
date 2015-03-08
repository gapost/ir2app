var Anneal = {
    baseTemperature : 25,
    maxdRdt : 8e-5,
    cycle : function (Ta,ta,tw) {
        Core.startRecording();
        data.rt.clear();

        Core.timedPrint("About to start anneal at " + Ta.toFixed(2) +"K ...")
        wait(60*1000);

        var R0 = data.rt.R13.mean();

        Core.timedPrint("Heating up ...")
		Anneal.setPIDparameters(Ta);
        TempCtrl.setSampleTs(Ta)
        wait(60*1000);
        Core.timedPrint("Annealing at " + Ta.toFixed(2) + "K, for " + ta + " min")
        wait(ta*60*1000);


        Core.timedPrint("Cooling down... ")
        TempCtrl.setSampleTs(Anneal.baseTemperature);
		Anneal.setPIDparameters(Anneal.baseTemperature);

        Core.timedPrint("Stabilizing at base T for "+ tw + " min")
        wait(tw*60*1000);

        Core.waitForStable(Anneal.maxdRdt)

        Core.timedPrint("Measuring R for 1 min")
        data.rt.clear();
        wait(60000)
        var R1 = data.rt.R13.mean();
        var ratio = data.rt.r.mean();
        var dR = R1-R0;


        Core.save("Anneal step. Ta=" + Ta.toFixed(2) + "K, ta=" + ta.toFixed(2) + "min");

        print("R0 = " + R0.toFixed(4))
        print("R1 = " + R1.toFixed(4))
        print("dR = " + dR.toExponential(2))

        Delta.setR15offset(6.6515+(R1-6.682)); // correct the value of R15 for the change in R 6.92:value with Tcs=23K
		Delta.setRratio(ratio/100);
       
    },
    cycleArray : function (Ta,ta,tw) {
        var n = Ta.length;
        for(var i=0; i<n; ++i)
        {
            Anneal.cycle(Ta[i],ta[i],tw[i]);
        }
    },
    setPIDparameters : function (Ta) {
        if (Ta <= 60) {
            dev.tcs1.gain = 0.001;
            dev.tcs2.gain = 0.001;
            dev.tcs1.Ti = 6;
            dev.tcs2.Ti = 6;
            dev.tcs1.beta = 1;
            dev.tcs2.beta = 1;
        } else if (Ta <= 90) {
            dev.tcs1.gain = 0.0015;
            dev.tcs2.gain = 0.0015;
            dev.tcs1.Ti = 6;
            dev.tcs2.Ti = 6;
            dev.tcs1.beta = 1;
            dev.tcs2.beta = 1;
        } else if (Ta <= 120) {
            dev.tcs1.gain = 0.0015;
            dev.tcs2.gain = 0.0015;
            dev.tcs1.Ti = 8;
            dev.tcs2.Ti = 8;
            dev.tcs1.beta = 0.95;
            dev.tcs2.beta = 0.95;
        } else if (Ta <= 160) {
            dev.tcs1.gain = 0.0015;
            dev.tcs2.gain = 0.0015;
            dev.tcs1.Ti = 10;
            dev.tcs2.Ti = 10;
            dev.tcs1.beta = 0.9;
            dev.tcs2.beta = 0.9;
        } else if (Ta <= 200) {
            dev.tcs1.gain = 0.0015;
            dev.tcs2.gain = 0.0015;
            dev.tcs1.Ti = 12;
            dev.tcs2.Ti = 12;
            dev.tcs1.beta = 0.85;
            dev.tcs2.beta = 0.85;
        } else if (Ta <= 260) {
            dev.tcs1.gain = 0.0015;
            dev.tcs2.gain = 0.0015;
            dev.tcs1.Ti = 14;
            dev.tcs2.Ti = 14;
            dev.tcs1.beta = 0.825;
            dev.tcs2.beta = 0.825;
        } else if (Ta <= 300) {
            dev.tcs1.gain = 0.002;
            dev.tcs2.gain = 0.002;
            dev.tcs1.Ti = 14;
            dev.tcs2.Ti = 14;
            dev.tcs1.beta = 0.8;
            dev.tcs2.beta = 0.8;
        } else if (Ta <= 400) {
            dev.tcs1.gain = 0.0022;
            dev.tcs2.gain = 0.0022;
            dev.tcs1.Ti = 14;
            dev.tcs2.Ti = 14;
            dev.tcs1.beta = 0.8;
            dev.tcs2.beta = 0.8;
        } else if (Ta <= 500) {
            dev.tcs1.gain = 0.0022;
            dev.tcs2.gain = 0.0022;
            dev.tcs1.Ti = 12;
            dev.tcs2.Ti = 12;
            dev.tcs1.beta = 0.8;
            dev.tcs2.beta = 0.8;
        } else {
            dev.tcs1.gain = 0.0022;
            dev.tcs2.gain = 0.0022;
            dev.tcs1.Ti = 10;
            dev.tcs2.Ti = 10;
            dev.tcs1.beta = 0.75;
            dev.tcs2.beta = 0.75;
        }
    },
    makeProgram : function() {
        var obj = { Ta : [], ta : [], tw : [] };
        var dT, T;

        /*dT=2.5;
        for(T=40; T<=90; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(5);   }
        dT=3;
        for(T=93; T<=120; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(5);  }
        dT=4;
        for(T=124; T<=160; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(7);  }
        dT=5;
        for(T=165; T<=200; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(7);  }
        dT=6;
        for(T=206; T<=260; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(7);  }
        dT=8;
        for(T=268; T<=300; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(8);  }*/
        dT=10;
        for(T=400; T<=400; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(10);  }
		//for(T=310; T<=400; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(10);  }
        dT=15;
        for(T=415; T<=520; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(20);  }
        dT=20;
        for(T=540; T<=700; T+=dT) { obj.Ta.push(T); obj.ta.push(dT); obj.tw.push(30);  }

        return obj;
    },
    doProgram : function() {
        var obj = Anneal.makeProgram();
        Anneal.cycleArray(obj.Ta,obj.ta,obj.tw);
    }
}


