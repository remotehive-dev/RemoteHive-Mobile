const fs = require('fs');
const path = process.argv[2] || 'android/app/build.gradle';
let b = fs.readFileSync(path, 'utf8');

// Only inject if not already present (idempotent for cache restores)
if (!b.includes('remotehive-keystore.jks')) {
  b = b.replace(/(android\s*\{)/,
    '$1\n    signingConfigs {\n        release {\n            storeFile file("remotehive-keystore.jks")\n            storePassword "remotehive123"\n            keyAlias "remotehive"\n            keyPassword "remotehive123"\n        }\n    }');
  b = b.replace(/(release\s*\{)/,
    '$1\n                signingConfig signingConfigs.release');
  fs.writeFileSync(path, b);
  console.log('Signing config injected');
} else {
  console.log('Signing config already present, skipping');
}
