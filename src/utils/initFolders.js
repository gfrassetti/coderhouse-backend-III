import fs from 'fs';
import path from 'path';
import __dirname from './index.js';

const folders = [
    path.join(__dirname, '../public/img/pets'),
    path.join(__dirname, '../public/img/documents'),
    path.join(__dirname, '../logs')
];

folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});

export default folders;
