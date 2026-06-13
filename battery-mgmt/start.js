const { spawn } = require('child_process');
const path = require('path');

const child = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: '/home/z/my-project/battery-mgmt',
  stdio: 'ignore',
  detached: true,
  env: { ...process.env }
});

child.unref();
console.log('Server started with PID:', child.pid);
