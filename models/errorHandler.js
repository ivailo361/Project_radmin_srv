const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../public/errorLogs.txt')

let time = new Date().toLocaleString('en-DE')


function errorLog(input) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            return console.log(err)
        }
        let add = `${data}\n${time}\n${input}`
        fs.writeFile(file, add, 'utf8', (err, data) => {
            if (err) return console.log(err);
        })
    })

}


module.exports = errorLog