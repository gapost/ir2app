/* Create a pressure Indicator Widget
  to display the readings from LEYBOLD DIFF-PUMP
  TTR91S & PTR225.

  The analog voltage from these gauges is read via the
  PCI-6221 card in channeles ai0 & ai1, respectively.
  */

function createPressureIndicator(loop, dataBuffer) {
    dev.newDAQmxTask("ai");
    with(dev.ai) {
        addAnalogInputChannel("Dev1/ai0");
        addAnalogInputChannel("Dev1/ai1");
        on();

        with(ch1) {
            signalName = "TTR91S Pressure";
            unit = "mbar";
            parserExpression = "10^((x-6.143)/1.286)";
            show();
        }
        with(ch2) {
            signalName = "PTR225 Pressure";
            unit = "mbar";
            parserExpression = "10^((x-12.66)/1.33)";
            show();
        }
    }
}

