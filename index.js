const Discord = require('discord.js')
const config = require('./config.json')
const client = new Discord.Client()

const prefix = '!'

client.on('message', function (message) {
  if (message.author.bot) return

  const commandBody = message.content.slice(prefix.length)
  const args = commandBody.split(' ')
  const command = args.shift().toLowerCase()

  if (message.content === `${prefix}ping`) {
    const timeTaken = Date.now() - message.createdTimestamp
    message.reply(`Pong! This message had a latency of ${timeTaken}ms.`)
  }

  if (message.content.startsWith(`${prefix}roll`)) {
    message.channel.send(
      `${message.author.username} rolls ${Math.floor(
        1 +
          Math.random() *
            (args.length ? (parseInt(args[0]) ? parseInt(args[0]) - 1 : 5) : 5)
      )}`
    )
  }

  const foissNames = ['foiss', 'pierre', 'foissac']
  if (foissNames.some((name) => message.content.toLowerCase().includes(name))) {
    const slurs = [
      'fripon',
      'pourceau',
      'sagouin',
      'paltoquet',
      'olibrius',
      'cuistre',
      'orchidoclaste',
      'nodocéphale',
      'forban',
      'foutriquet',
      'gaupe',
      'gougnafier',
      'houlier',
      'vil palefrenier',
      'coprophage',
    ]
    const randomSlur = slurs[Math.floor(Math.random() * slurs.length)]
    const pierreId = '267704102073401355'
    let mentionString = '<@!' + pierreId + '>'
    message.channel.send(`${mentionString} est un ${randomSlur} !`)
  }

  if (message.content.startsWith(`${prefix}sondage`)) {
    const quotedArgs = commandBody.match(/\w+|"[^"]+"/g)
    quotedArgs.shift()

    const pollEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Sondage')
      .setAuthor(message.author.username)
      .addFields({
        name: quotedArgs[0],
        value: `${quotedArgs[1]}\n${quotedArgs[2]}`,
      })
      .setTimestamp()

    message.channel.send(pollEmbed)
  }
})

client.login(config.BOT_TOKEN)
