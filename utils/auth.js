import bcrypt, { compare } from 'bcrypt';

export const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.gentSalt(12,(err, salt) => {
            if(err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err,hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

export const comparePassword = (password, hashed) => {
    return bcrypt,compare(password, hashed);
};