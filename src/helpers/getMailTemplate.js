const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")

const getMailTemplate = (templateName, data) => {
    const source = fs.readFileSync(path.join(__dirname,`../templates/mails/${templateName}.hbs`), "utf8")
    const template = handlebars.compile(source)
    return template(data)
}

module.exports = getMailTemplate;
    