const multer = require('multer')
const path = require('path');

function readFile(req, res, next) {

    let filePath = path.normalize(
        path.join(__dirname, '../public/')
    )
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, filePath)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            // cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx')
            cb(null, Date.now() + '-' + file.originalname)
        }
    })
    let upload = multer({ storage: storage }).single('avatar')

    return upload(req, res, next)
    
}

module.exports = readFile

