const fs = require('fs');
const path = require('path');

const packages = ['core', 'react', 'ui'];
const rootDir = path.resolve(__dirname, '..');

packages.forEach((pkg) => {
  const filePath = path.join(rootDir, 'packages', pkg, 'package.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.repository = {
      type: 'git',
      url: 'git+https://github.com/imnurav/playerkit.git'
    };
    data.homepage = 'https://imnurav.github.io/playerkit/';
    data.bugs = {
      url: 'https://github.com/imnurav/playerkit/issues'
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Injected/Verified GitHub metadata in packages/${pkg}/package.json`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});
