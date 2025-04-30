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
if (versionType === 'major') {// Incrementa a versão major
    major += 1;// Reseta minor e patch
    minor = 0;// Reseta hotfix
    patch = 0;// Reseta hotfix
    hotfix = undefined; // Resetar hotfix ao subir versão major
} else if (versionType === 'minor') {// Incrementa a versão minor
    minor += 1;// Reseta patch e hotfix
    patch = 0;// Reseta hotfix
    hotfix = undefined;// Reseta hotfix
} else if (versionType === 'patch') {// Incrementa a versão patch
    patch += 1;// Reseta hotfix
    hotfix = undefined;// Reseta hotfix
} else if (versionType === 'hotfix') {// Incrementa a versão hotfix
    hotfix = hotfix !== undefined ? hotfix + 1 : 1;// Se hotfix já existir, incrementa; caso contrário, inicia em 1
} else {// Tipo de versão inválido
    console.error('Tipo de versão inválido. Use "major", "minor", "patch" ou "hotfix".');
    process.exit(1);// Encerra o processo com erro
}

// Monta a nova versão, incluindo hotfix apenas se existir
const newVersion = hotfix !== undefined ? `${major}.${minor}.${patch}.${hotfix}` : `${major}.${minor}.${patch}`;// Se hotfix não existir, monta a versão sem ele
packageJson.version = newVersion;// Atualiza a versão no package.json

// Escreve a nova versão no package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));// Formata o JSON com 2 espaços de indentação

// Atualiza o .env.local com a nova versão
const envContent = `VITE_APP_VERSION=${newVersion}\n`;      // Cria o conteúdo do .env.local com a nova versão
fs.writeFileSync(envFilePath, envContent);  // Escreve o conteúdo no .env.local

console.log(`📢 Versão atualizada para ${newVersion}`); 
