var tessel = require('tessel');
var blePort = tessel.port('a');



var ble = require('../').use(blePort);
ble.on('ready', function(err) {
	if (err) return console.log(err);
  console.log("Module ready but wait... where did Moosh go!?");
  ble.startScanning(false);
});

ble.on('error', function(err) {
  console.log("Could not connect to module: ", err);
});

ble.on('scanStart', function(err, result) {
  if (result == 0) {
    console.log("Moosh, where are you?");
  }
});

ble.on('scanStop', function(err, result) {
  if (result == 0) {
    console.log("Call off the search!");
  }
});

ble.on('discover', connectIfMoosh);

function mooshConnected() {
  ble.removeListener('discover', connectIfMoosh);
  console.log("We're connected to mooshimeter!");

  this.discoverAllCharacteristics(function(err, services) {
    if (err) console.log("Couldn't discover services: ", err);
    else {
      console.log("Found services:");
      for (var service in services) {
        console.log(service);
      }
    }
    this.disconnect(function(err) {
      console.log("Disconnected from moosh");
    });
  }.bind(this));
}

function connectIfMoosh(peripheral) {
  console.log("Discovered peripheral!");
  // console.log("Discovered peripheral! Address: ", peripheral.address, ", RSSI: ", peripheral.rssi);
  console.log("Could it be Moosh?");

  detectMoosh(peripheral, function(isMoosh) {
    if (isMoosh) {
      console.log("Found Moosh!");

      moosh = peripheral;

      ble.stopScanning();

      moosh.connect(); 
      
      moosh.on('connected', mooshConnected.bind(moosh));
    }
    else 
    {
      console.log("Damn, it's not Moosh.");
    }
  });
}
function detectMoosh(peripheral, callback) {
  for (var i = 0; i < peripheral.advertisingData.length; i++) {
    var packet = peripheral.advertisingData[i];

    if (packet.type = 'Incomplete List of 16-bit Service Class UUIDs'
        && packet.data[0] == '0xffa0') {
      return callback && callback(true);
    }
  }

  return callback && callback(false);
}

setInterval(function() {

}, 20000);  