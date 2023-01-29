import bcrypt from 'bcrypt'

// this function hashes tha password
export const hashPassword = (password) => {
    return new Promise((resolve, reject) => {

        // genSalt is provided by bcrypt for hashing passwords
        // the basic syntax is :
        // bcrypt.genSalt(saltRounds, function(err, salt) {
        //     if (err) {reject(err)}    
        //     bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        //         if(err){reject(err)}
        //         resolve(hash) 
        //     });
        // });

        // ** salt rounds - A salt is a random string that makes the hash unpredictable
        // salt rounds are actually the cost factor, that controlls how much time is needed to calculate
        // a single BCrypt hash, higher the cost factor more hashing rounds are done i.e. more time 
        // to crack password i.e. brute-forcing is more difficult.
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
}

// this function compares the hashed password and passwrod received password
// from the user
export const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed);    // it will return a boolen i.e. either true or false after comparing the passwords
}