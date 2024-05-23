const { Service } = require('node-windows');
const path = require('path');

// Specify the absolute path to the service script
const serviceScriptPath = path.join(__dirname, 'service.js');

// Create a new service object with the same name as when you installed the service
const svc = new Service({
  name: 'VGSNodeApp2',
  script: serviceScriptPath
});

// Listen for the "uninstall" event, which indicates the service is uninstalled
svc.on('uninstall', () => {
  console.log('Service uninstalled successfully.');
});

// Uninstall the service
svc.uninstall();