module.exports = {
    development: {
        port: process.env.PORT || 3333,
        db_user: process.env.db_user || "koko",
        db_pass: process.env.db_pass || "Koko1978",
        db_name: process.env.db_name || "also",
        db_saltRounds: process.env.db_saltRounds || 9, 
        db_secret: process.env.db_secret || 'ivo'
    },
    production: {
        port: process.env.PORT || 3333,
        db_user: process.env.db_user || "koko",
        db_pass: process.env.db_pass || "Koko1978",
        db_name: process.env.db_name || "also",
        db_saltRounds: process.env.db_saltRounds || 9, 
        db_secret: process.env.db_secret || 'ivo'
    }
};