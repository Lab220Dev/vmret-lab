const fs = require('fs');
const path = require('path');

// Caminho do package.json e .env.local
const packageJsonPath = path.resolve(__dirname, 'package.json');
const envFilePath = path.resolve(__dirname, '.env.local');

// Lê o package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Obtém a versão atual e separa os números
let [major, minor, patch, hotfix] = packageJson.version.split('.').map(Number);

// Obtém o tipo de incremento passado como argumento (exemplo: "npm run build patch")
const versionType = process.argv[2] || 'patch'; // Default: patch

// Define a nova versão com base no argumento passado
if (versionType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
    hotfix = undefined; // Resetar hotfix ao subir versão major
} else if (versionType === 'minor') {
    minor += 1;
    patch = 0;
    hotfix = undefined;
} else if (versionType === 'patch') {
    patch += 1;
    hotfix = undefined;
} else if (versionType === 'hotfix') {
    hotfix = hotfix !== undefined ? hotfix + 1 : 1;
} else {
    console.error('Tipo de versão inválido. Use "major", "minor", "patch" ou "hotfix".');
    process.exit(1);
}

// Monta a nova versão, incluindo hotfix apenas se existir
const newVersion = hotfix !== undefined ? `${major}.${minor}.${patch}.${hotfix}` : `${major}.${minor}.${patch}`;
packageJson.version = newVersion;

// Escreve a nova versão no package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Atualiza o .env.local com a nova versão
const envContent = `VITE_APP_VERSION=${newVersion}\n`;
fs.writeFileSync(envFilePath, envContent);

console.log(`📢 Versão atualizada para ${newVersion}`);
