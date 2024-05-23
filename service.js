const { Service } = require('node-windows');
const path = require('path');


const svc = new Service({
  name: 'VGSNodeApp2', 
  description: 'My Node.js running as a service', 
  script: path.join(__dirname, './dist/index.js'), 
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the service is installed
svc.on('install', () => {
  svc.start();
});

// Install the service
svc.install();
