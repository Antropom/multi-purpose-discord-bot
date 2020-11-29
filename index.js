const Discord = require('discord.js')
const { rollotron } = require('./rollotron')
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
    rollotron(message, args)
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
    // Créé un tableau en séparant les arguments entre parenthèses
    const quotedArgs = commandBody.match(/\w+|"[^"]+"/g)

    const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫']

    // Vérification de du nombre d'arguments
    if (quotedArgs.length <= 3) {
      message.channel.send(
        'Veuillez poser une question et proposer au moins deux réponses'
      )
      return
    } else if (quotedArgs.length > 8) {
      message.channel.send('Veuillez saisir au maximum six réponses')
      return
    }

    // On enlève la commande
    quotedArgs.shift()

    const questionTitle = quotedArgs.shift()

    // Création de chaque réponse possible en y ajoutant des émojis
    const answersWithEmojis = quotedArgs.map(
      (answer, i) => `${emojis[i]} ${answer}`
    )

    // Création de la string avec retours à la ligne pour l'embes
    const stringAnswers = answersWithEmojis.join('\n')

    const pollEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Sondage de ${message.author.username}`)
      .addFields({
        name: questionTitle.replace(/['"]+/g, ''),
        value: `${stringAnswers.replace(/['"]+/g, '')}`,
      })
      .setTimestamp()

    message.channel
      .send(pollEmbed)
      .then((embedMessage) => {
        answersWithEmojis.forEach((reaction, i) =>
          embedMessage.react(emojis[i])
        )
      })
      .then(() => {
        message.delete()
      })
  }
})

client.login(config.BOT_TOKEN)
