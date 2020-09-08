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
    if (message.author.bot)return
    let commandArgs = content.split(' ')
    switch (commandArgs[0].toLowerCase()) {
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
        case 'scorerps':
            if (commandArgs[1]){
                if ('<@!'+message.author+'>' === commandArgs[1]){
                    return message.channel.send('lol')
                }
                const scores = getRPSScores()
                const score = getRPSscore(scores,'<@!'+message.author+'>', commandArgs[1])
                if (!score){
                    message.channel.send('You never played Rock, Paper, Scissors with this player.')
                }
                else{
                    let tempScore1 = '<@!'+message.author+'>' === score.p1? score.scoreP1 : score.scoreP2
                    let tempScore2 = commandArgs[1] === score.p1? score.scoreP1 : score.scoreP2
                    let embed = new discord.MessageEmbed().setColor('BLUE').setTitle('Rock, Paper, Scissors')
                    embed.addField('Scores:', '<@!'+message.author+'>: ' + tempScore1+'\n'+commandArgs[1]+': '+tempScore2)
                    message.channel.send(embed)
                }
            }
            else{
                message.channel.send('Please mention the person that you want to check the score of.')
            }
            break
        case 'help':
            displayHelp(commandArgs[1],message)
            break
        
        default: 
            message.channel.send('Unrecognized command, use >help to display a list of all commands or >help [command-name] to display help for a specific command.')
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
            let scores = getRPSScores()
            let currentScore = findRPSScore(scores)
            if (currentScore === -1){
                currentScore = scores.length
                scores.push({
                    p1: rps.initiatingPlayer,
                    p2: rps.pendingPlayer,
                    scoreP1: 0,
                    scoreP2: 0
                })
            }
            if (rps.initiatingPlayerChoice == rps.pendingPlayerChoice) {
                embed.setColor('BLUE').setDescription('Its a tie!')
            }
            else if ((rps.initiatingPlayerChoice == 'Rock' && rps.pendingPlayerChoice == 'Scissors') || (rps.initiatingPlayerChoice == 'Paper' && rps.pendingPlayerChoice == 'Rock') || (rps.initiatingPlayerChoice == 'Scissors' && rps.pendingPlayerChoice == 'Paper')) {
                embed.setColor('GREEN').setDescription(rps.initiatingPlayer + ' Won!')
                if (rps.initiatingPlayer === scores[currentScore].p1){
                    scores[currentScore].scoreP1++
                }
                else{
                    scores[currentScore].scoreP2++
                }
            }
            else {
                embed.setColor('RED').setDescription(rps.pendingPlayer + ' Won!')
                if (rps.pendingPlayer === scores[currentScore].p1){
                    scores[currentScore].scoreP1++
                }
                else{
                    scores[currentScore].scoreP2++
                }
            }
            let tempInitScore = rps.initiatingPlayer === scores[currentScore].p1?scores[currentScore].scoreP1:scores[currentScore].scoreP2
            let tempPendingScore = rps.pendingPlayer === scores[currentScore].p1?scores[currentScore].scoreP1:scores[currentScore].scoreP2

            embed.addField('Result: ', rps.initiatingPlayer + ': ' + rps.initiatingPlayerChoice+'\n'+rps.pendingPlayer+': '+rps.pendingPlayerChoice)
            embed.addField('Scores:', rps.initiatingPlayer + ': ' + tempInitScore+'\n'+rps.pendingPlayer+': '+tempPendingScore)
            embed.setFooter('GG!')
            saveRPSScores(scores)
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

const getRPSScores = () => {
    try{
        return JSON.parse(fs.readFileSync(path.join(__dirname, "../data/storage/rpsScores.json")).toString())
    }
    catch (e){
        return []
    }
}

const getRPSscore = (scores, p1, p2) =>{
    let temp = scores.find((score)=>{
        return (p1 === score.p1 && p2 === score.p2) || (p1 === score.p2 && p2 === score.p1)
    })
    return temp
}

const findRPSScore = (scores) => {
    let temp = getRPSscore(scores, rps.initiatingPlayer, rps.pendingPlayer)
    return scores.indexOf(temp)
}

const saveRPSScores = (scores) =>{
    fs.writeFileSync(path.join(__dirname, '../data/storage/rpsScores.json'), JSON.stringify(scores))
}

const displayHelp = (text, message) =>{
    const rps_help = ">rps <player>: challenge a player for a rock, paper, scissors game by mentioning them."
    const cancel_help = ">cancel: cancel a pending rock, paper, scissors game."
    const decline_help = ">decline: decline a pending rock, paper, scissors game."
    const accept_help = ">accept: accept a pending rock, paper, scissors game."
    const scorerps_help = ">scorerps <player>: display your score against a specific player by mentioning them."
    const help_help = ">help [command-name]: displays all commands, if [command-name] is provided, it displays help for that specific command instead."
    if (!text){
        return message.channel.send(rps_help+'\n'+cancel_help+'\n'+decline_help+'\n'+accept_help+'\n'+scorerps_help+'\n'+help_help)
    }
    switch(text.toLowerCase()){
        case 'rps': return message.channel.send(rps_help)
        case 'cancel': return message.channel.send(cancel_help)
        case 'decline': return message.channel.send(decline_help)
        case 'accept': return message.channel.send(accept_help)
        case 'scorerps': return message.channel.send(scorerps_help)
        case 'help': return message.channel.send(help_help)
        default: return message.channel.send('Unrecognized command, please try agian.')
    }
}
