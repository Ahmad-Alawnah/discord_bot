
const LOG_TAG = '[bomber]: '
const PREFIX = '>'
const data = require('../data.json')
const discord = require('discord.js')
const client = new discord.Client()

let inGame = false
let preGame = false;
let pendingPlayer = undefined
let initiatingPlayer = undefined
let challengeChannel = undefined
let pendingPlayerChoice = undefined
let initiatingPlayerChoice = undefined

client.login(data.token)

client.on('ready', () => {
    console.log(LOG_TAG + "ready")
})

client.on('message', (message) => {
    let content = message.content
    if (message.channel.type === 'dm') {
        if (inGame) {
            if ('<@!' + message.author + '>' == initiatingPlayer) {
                if (initiatingPlayerChoice !== undefined) {
                    message.author.send('You already picked your choice.').catch(console.error)
                }
                else if (message.content.toLowerCase()[0] == 'r' || message.content.toLowerCase()[0] == 'p' || message.content.toLowerCase()[0] == 's') {
                    switch (message.content.toLowerCase()[0]) {
                        case 'r':
                            initiatingPlayerChoice = 'Rock'
                            break
                        case 'p':
                            initiatingPlayerChoice = 'Paper'
                            break
                        case 's':
                            initiatingPlayerChoice = 'Scissors'
                            break
                    }
                    message.author.send('Choice saved!').catch(console.error)
                }
                else {
                    message.author.send('Please make sure that your choice is either \'R\', \'P\' or \'S\'.').catch(console.error)
                }
            }
            else if ('<@!' + message.author + '>' == pendingPlayer) {
                if (pendingPlayerChoice !== undefined) {
                    message.author.send('You already picked your choice.').catch(console.error)
                }
                else if (message.content.toLowerCase()[0] == 'r' || message.content.toLowerCase()[0] == 'p' || message.content.toLowerCase()[0] == 's') {
                    switch (message.content.toLowerCase()[0]) {
                        case 'r':
                            pendingPlayerChoice = 'Rock'
                            break
                        case 'p':
                            pendingPlayerChoice = 'Paper'
                            break
                        case 's':
                            pendingPlayerChoice = 'Scissors'
                            break
                    }
                    message.author.send('Choice saved!').catch(console.error)
                }
                else {
                    message.author.send('Please make sure that your choice is either \'R\', \'P\' or \'S\'.').catch(console.error)
                }
            }

            if (initiatingPlayerChoice !== undefined && pendingPlayerChoice !== undefined) {
                embed = new discord.MessageEmbed().setTitle('Rock, Paper, Scissors!')
                if (initiatingPlayerChoice == pendingPlayerChoice) {
                    embed.setColor('BLUE').setDescription('Its a tie!')
                }
                else if ((initiatingPlayerChoice == 'Rock' && pendingPlayerChoice == 'Scissors') || (initiatingPlayerChoice == 'Paper' && pendingPlayerChoice == 'Rock') || (initiatingPlayerChoice == 'Scissors' && pendingPlayerChoice == 'Paper')) {
                    embed.setColor('GREEN').setDescription(initiatingPlayer + ' Won!')
                }
                else {
                    embed.setColor('RED').setDescription(pendingPlayer + ' Won!')
                }

                embed.addField('Result: ', initiatingPlayer + ': ' + initiatingPlayerChoice+'\n'+pendingPlayer+': '+pendingPlayerChoice)
                embed.setFooter('GG!')
                challengeChannel.send(embed)
                initiatingPlayer = undefined
                initiatingPlayerChoice = undefined
                pendingPlayer = undefined
                pendingPlayerChoice = undefined
                inGame = false
                challengeChannel = undefined
            }
        }
    }
    else if (content.startsWith(PREFIX)) {
        content = content.substr(1)
        console.log(content)
        if (content.trim() == '') return
        let commandArgs = content.split(' ')

        switch (commandArgs[0]) {
            case 'rps':
                if (preGame) {
                    message.channel.send('Only one challenge can be present at the same time, if you wish to cancel a challenge, use >cancel.')
                }
                if (inGame) {
                    message.channel.send('Another challenge is currently running, please wait for it to finish before starting a new one.')
                }
                if (commandArgs[1] == undefined || !(commandArgs[1].startsWith('<@') && commandArgs[1].endsWith('>'))) {
                    message.channel.send('Please mention the person that you want to challenge.')
                }
                else {
                    initiatingPlayer = '<@!' + message.author.id + '>'
                    pendingPlayer = commandArgs[1]
                    console.log(pendingPlayer + ' ' + initiatingPlayer)
                    if (initiatingPlayer === pendingPlayer) {
                        message.channel.send('You can\'t challenge yourself, ' + initiatingPlayer)
                        initiatingPlayer = undefined
                        pendingPlayer = undefined
                    }
                    else {
                        message.channel.send('Hey ' + pendingPlayer + ', ' + initiatingPlayer + ' is challenging you to a game of Rock, Paper, Scissors! type >accept to accept the challenge or >decline to decline.')
                        preGame = true
                        challengeChannel = message.channel
                    }
                }
                break
            case 'cancel':
                if (message.channel === challengeChannel) {
                    if (preGame) {
                        if ('<@!' + message.author + '>' == initiatingPlayer) {
                            initiatingPlayer = undefined
                            pendingPlayer = undefined
                            preGame = false
                            inGame = false
                            challengeChannel = undefined
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
                if (message.channel === challengeChannel) {
                    if (preGame) {
                        if ('<@!' + message.author + '>' == pendingPlayer) {
                            message.channel.send(pendingPlayer + ' declined the challenge!')
                            initiatingPlayer = undefined
                            pendingPlayer = undefined
                            preGame = false
                            inGame = false
                            challengeChannel = undefined
                        }
                    }
                }
                break
            case 'accept':
                if (message.channel === challengeChannel) {
                    if (preGame) {
                        if ('<@!' + message.author + '>' == pendingPlayer) {
                            preGame = false
                            inGame = true
                            challengeChannel = message.channel
                            challengeChannel.send(pendingPlayer + ' accepted the challenge!')
                            challengeChannel.send(initiatingPlayer + ' and ' + pendingPlayer + ', send your choice (R, P or S) to me in a direct message!')
                        }
                    }
                }
                break
        }
    }

})

