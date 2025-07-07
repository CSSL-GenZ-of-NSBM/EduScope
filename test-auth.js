// Quick test script to debug authentication
const bcrypt = require('bcryptjs');

// Test bcrypt functionality
const testPassword = 'password123';
const hash = bcrypt.hashSync(testPassword, 12);
console.log('Test hash:', hash);

const isValid = bcrypt.compareSync(testPassword, hash);
console.log('Comparison result:', isValid);

// Test with the exact login you're trying
const loginPassword = 'password123'; // Use the actual password you're trying
const dbHash = '$2a$12$VvQeh54cBzSVvaGLuoX2Ue9Ctf8Xh1cHVyAVakT/uO3epI96FxQ6G'; // If you know the hash from DB

const loginResult = bcrypt.compareSync(loginPassword, dbHash);
console.log('Login comparison result:', loginResult);
