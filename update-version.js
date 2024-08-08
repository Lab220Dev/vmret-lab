const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

// Caminho do .env.local
const envFilePath = path.resolve(__dirname, '.env.local');

// Versão do package.json
const version = packageJson.version;

// Conteúdo a ser escrito no .env.local
const envContent = `VITE_APP_VERSION=${version}\n`;

// Escreve ou substitui o arquivo .env.local
fs.writeFileSync(envFilePath, envContent);

console.log(`Versão ${version} atualizada no .env.local`);
