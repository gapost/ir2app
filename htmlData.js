/*
  Create a html table with 3 columns
    Quantity, Unit, Actual Value
  and save to a file
*/

// begin the table
var html = "<table><tr><th>Quantity</th><th>Unit</th><th>Value</th></tr>";

// Date & time
var date = new Date();
html += "<tr><td>";
html += "Date";
html += "</td><td>";
html += "-";
html += "</td><td>";
html += date.toLocaleDateString();
html += "</td></tr>";
html += "<tr><td>";
html += "Time";
html += "</td><td>";
html += "-";
html += "</td><td>";
html += date.toLocaleTimeString();
html += "</td></tr>";

// Beam on-off
html += "<tr><td>";
html += "Beam status";
html += "</td><td>";
html += "-";
html += "</td><td>";
html += dev.beamCap.ch1.value() ? "Off" : "On";
html += "</td></tr>";

// Beam current
html += "<tr><td>";
html += "Beam current";
html += "</td><td>";
html += "% FS";
html += "</td><td>";
var i = dev.beamCounter.ch1.Ib;
html += i.toFixed(1);
html += "</td></tr>";

// end the table
html += "</table>";

// save
textSave(html,"liveData.html");
