/* Create auxiliary control functions

   Created 9/2/2015 by GA

   Creates a DAQmx Task to measure 2 coltages
   connected to NI PCI 6221 card
*/

function createPressureIndicator(loop,dataBuffer) {
    dev.newDAQmxTask("ai");
    dev.ai.addAnalogInputChannel("Dev1/ai0","NRSE",0.,10.);
    dev.ai.addAnalogInputChannel("Dev1/ai1","NRSE",0.,10.);
    with(dev.ai.ch1)
    {
        signalName = "Low Vacuum Gauge"
        unit = "mbar"
        parserExpression = "10^((x-6.143)/1.286)";
        format = "E";
        precision = 1;
    }
    with(dev.ai.ch2)
    {
        signalName = "High Vacuum Gauge"
        unit = "mbar"
        parserExpression = "10^((x-12.66)/1.33)";
        format = "E";
        precision = 1;
    }
    dev.ai.on()
    dev.ai.arm()

    dataBuffer.addChannel(dev.ai.ch1);
    dataBuffer.addChannel(dev.ai.ch2);

    loop.commit(dev.ai);


    with(data.rt)
    {
        newVector(["Plow", "Phigh"])
    }
    with(data.buff)
    {
        newVector(["Plow", "Phigh"])
    }
}

function showPressureChannels(on)
{
    with(dev.ai)
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
}


