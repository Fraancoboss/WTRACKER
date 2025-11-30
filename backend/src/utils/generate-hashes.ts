import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

const passwords = {
    admin: 'admin123',
    oficina: 'oficina123',
    fabricacion: 'fab123',
    cristal: 'cristal123',
    persianas: 'persianas123',
    transporte: 'trans123',
    visualizacion: 'visual123',
};

async function generateHashes() {
    console.log('Generating bcrypt hashes...\n');

    for (const [name, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        console.log(`${name}: ${password}`);
        console.log(`Hash: ${hash}\n`);
    }
}

generateHashes().catch(console.error);
