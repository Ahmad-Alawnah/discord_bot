const { MessageAttachment } = require("discord.js")

const prefix = '>'
const parseMessage = function(message){
    content = message.content
    if (content.startsWith(prefix)){
        content = content.substr(1)
        switch(content.toLowerCase()){
            case "hello": return "Hi, <@"+ message.author.id+">"
            case "test": return "1 2 3"
            case "meme": return new MessageAttachment("C:\\Users\\aalaw\\Desktop\\Memes\\meme1.jpg")
            default: return "Yasuo"
        }
    }
    else{
        return null
    }
}

module.exports = parseMessage;