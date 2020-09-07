const fs = require('fs')
const path = require('path')
const data = require('../data.json')
const discord = require('discord.js')
const client = new discord.Client()

//rock paper scissors object that contains variables used to manage rps game
rps = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/variables/rps.json')).toString())

client.login(data.TOKEN)

client.on('ready', () => {
    console.log(data.LOG_TAG + "ready")
})

client.on('message', (message) => {
    let content = message.content
    if (message.channel.type === 'dm') {
        handleDM(message)
    }
    else if (content.startsWith(data.PREFIX)) {
        content = content.substr(1)
        if (content.trim() == '') return
        handleChannelCommand(content, message)
    }

})

//general commands in public channels
const handleChannelCommand = (content, message)=>{
    let commandArgs = content.split(' ')
    switch (commandArgs[0]) {
        case 'rps':
            if (rps.preGame) {
                message.channel.send('Only one challenge can be present at the same time, if you wish to cancel a challenge, use >cancel.')
            }
            else if (rps.inGame) {
                message.channel.send('Another challenge is currently running, please wait for it to finish before starting a new one.')
            }
            else if (commandArgs[1] == undefined || !(commandArgs[1].startsWith('<@') && commandArgs[1].endsWith('>'))) {
                message.channel.send('Please mention the person that you want to challenge.')
            }
            else {
                rps.initiatingPlayer = '<@!' + message.author.id + '>'
                rps.pendingPlayer = commandArgs[1]
                if (rps.initiatingPlayer === rps.pendingPlayer) {
                    message.channel.send('You can\'t challenge yourself, ' + rps.initiatingPlayer)
                    resetRPS()
                }
                else {
                    message.channel.send('Hey ' + rps.pendingPlayer + ', ' + rps.initiatingPlayer + ' is challenging you to a game of Rock, Paper, Scissors! type >accept to accept the challenge or >decline to decline.')
                    rps.preGame = true
                    rps.challengeChannel = message.channel
                }
            }
            break
        case 'cancel':
            if (message.channel === rps.challengeChannel) {
                if (rps.preGame) {
                    if ('<@!' + message.author + '>' == rps.initiatingPlayer) {
                        resetRPS()
                        message.channel.send('Challenge cancelled, to start a new one, type >rps <player> to challenge <player>.')
                    }
                    else {
                        message.channel.send('Only the person who started the challenge can cancel it.')
                    }
                }
                else {
                    message.channel.send('There is no pending challenge to cancel.')
                }
            }
            break
        case 'decline':
            if (message.channel === rps.challengeChannel) {
                if (rps.preGame) {
                    if ('<@!' + message.author + '>' == rps.pendingPlayer) {
                        message.channel.send(rps.pendingPlayer + ' declined the challenge!')
                        resetRPS()
                    }
                }
            }
            break
        case 'accept':
            if (message.channel === rps.challengeChannel) {
                if (rps.preGame) {
                    if ('<@!' + message.author + '>' == rps.pendingPlayer) {
                        rps.preGame = false
                        rps.inGame = true
                        rps.challengeChannel = message.channel
                        rps.challengeChannel.send(rps.pendingPlayer + ' accepted the challenge!')
                        rps.challengeChannel.send(rps.initiatingPlayer + ' and ' + rps.pendingPlayer + ', send your choice (R, P or S) to me in a direct message!')
                    }
                }
            }
            break
    }
}

const handleDM = (message) => {
    if (rps.inGame) {
        if ('<@!' + message.author + '>' == rps.initiatingPlayer) {
            if (rps.initiatingPlayerChoice) {
                message.author.send('You already picked your choice.').catch(console.error)
            }
            else if (message.content.toLowerCase()[0] == 'r' || message.content.toLowerCase()[0] == 'p' || message.content.toLowerCase()[0] == 's') {
                switch (message.content.toLowerCase()[0]) {
                    case 'r':
                        rps.initiatingPlayerChoice = 'Rock'
                        break
                    case 'p':
                        rps.initiatingPlayerChoice = 'Paper'
                        break
                    case 's':
                        rps.initiatingPlayerChoice = 'Scissors'
                        break
                }
                message.author.send('Choice saved!').catch(console.error)
            }
            else {
                message.author.send('Please make sure that your choice is either \'R\', \'P\' or \'S\'.').catch(console.error)
            }
        }
        else if ('<@!' + message.author + '>' == rps.pendingPlayer) {
            if (rps.pendingPlayerChoice) {
                message.author.send('You already picked your choice.').catch(console.error)
            }
            else if (message.content.toLowerCase()[0] == 'r' || message.content.toLowerCase()[0] == 'p' || message.content.toLowerCase()[0] == 's') {
                switch (message.content.toLowerCase()[0]) {
                    case 'r':
                        rps.pendingPlayerChoice = 'Rock'
                        break
                    case 'p':
                        rps.pendingPlayerChoice = 'Paper'
                        break
                    case 's':
                        rps.pendingPlayerChoice = 'Scissors'
                        break
                }
                message.author.send('Choice saved!').catch(console.error)
            }
            else {
                message.author.send('Please make sure that your choice is either \'R\', \'P\' or \'S\'.').catch(console.error)
            }
        }

        if (rps.initiatingPlayerChoice && rps.pendingPlayerChoice) {
            embed = new discord.MessageEmbed().setTitle('Rock, Paper, Scissors!')
            if (rps.initiatingPlayerChoice == rps.pendingPlayerChoice) {
                embed.setColor('BLUE').setDescription('Its a tie!')
            }
            else if ((rps.initiatingPlayerChoice == 'Rock' && rps.pendingPlayerChoice == 'Scissors') || (rps.initiatingPlayerChoice == 'Paper' && rps.pendingPlayerChoice == 'Rock') || (rps.initiatingPlayerChoice == 'Scissors' && rps.pendingPlayerChoice == 'Paper')) {
                embed.setColor('GREEN').setDescription(rps.initiatingPlayer + ' Won!')
            }
            else {
                embed.setColor('RED').setDescription(rps.pendingPlayer + ' Won!')
            }

            embed.addField('Result: ', rps.initiatingPlayer + ': ' + rps.initiatingPlayerChoice+'\n'+rps.pendingPlayer+': '+rps.pendingPlayerChoice)
            embed.setFooter('GG!')
            rps.challengeChannel.send(embed)
            resetRPS()
        }
    }
}

const resetRPS = () =>{
    rps.initiatingPlayer = undefined
    rps.initiatingPlayerChoice = undefined
    rps.pendingPlayer = undefined
    rps.pendingPlayerChoice = undefined
    rps.inGame = false
    rps.challengeChannel = undefined
    rps.preGame = false
}

