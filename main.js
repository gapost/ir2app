var loopPeriod = 333; // ms
var measDelay = 3;
var tcpTimeout = 1000;
var Rheater1 = 0.087; // Ohm
var Rheater2 = 0.076; // Ohm
var alpha = 7/100; // deviation (R12-R23)/R13
var R15 = 9.499; // Resistance at 15K
var Is = 0.1; // sample current = 20mA

data.sampleName = "pure Fe, hand cut, electropolished, annealed 800C, 12h";
data.irradNum = 29;

exec("./ir2app/include.js")


// Create all sub-components
Core.create(loopPeriod,measDelay);
Delta.create(alpha,R15);
TempCtrl.create(tcpTimeout,Rheater1,Rheater2);
RateMonitors.create();
Aux.create();
IrradCtrl.create();

// allocate buffers
Core.setBufferCap();

// populate channels
TempCtrl.showChannels(1);
RateMonitors.showChannels(1);
Aux.showChannels(1);

Core.restoreWindow();

Core.start(1);
Delta.start(Is);
TempCtrl.start(1);
Aux.start(1);







