'use strict';

const { spawnSync } = require('child_process');

const buildScript = require.resolve('react-scripts/scripts/build.js');
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
// OpenSSL 3 (Node 17+) breaks webpack 4's default hash unless legacy provider is enabled.
// Node 16 and earlier use OpenSSL 1.1.1 and do not support this flag.
const nodeArgs =
  nodeMajor >= 17 ? ['--openssl-legacy-provider', buildScript] : [buildScript];

const result = spawnSync(process.execPath, nodeArgs, {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

if (result.signal) {
  process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);
