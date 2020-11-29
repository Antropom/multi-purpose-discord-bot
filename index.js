const Discord = require('discord.js')
const { rollotron } = require('./rollotron')
const { PollDatabase } = require('./poll-database')
const config = require('./config.json')
const client = new Discord.Client()

const prefix = '!'
let database = new PollDatabase()

client.once('ready', () => {
  database.sync()
})

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

    const questionTitle = quotedArgs.shift().replace(/['"]+/g, '')

    // Création de chaque réponse possible en y ajoutant des émojis
    const answersWithEmojis = quotedArgs.map(
      (answer, i) => `${emojis[i]} ${answer.replace(/['"]+/g, '')}`
    )

    database
      .create(message.author.id, questionTitle, answersWithEmojis)
      .then((pollId) => {
        if (pollId === -1) {
          message.channel.send(
            'Un problème est survenu lors de la création du sondage.'
          )
          return
        }
        // Création de la string avec retours à la ligne pour l'embes
        const stringAnswers = answersWithEmojis.join('\n')

        const pollEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`Sondage #${pollId} de ${message.author.username}`)
          .addFields({
            name: questionTitle,
            value: `${stringAnswers}`,
          })
          .setTimestamp()

        message.channel
          .send(pollEmbed)
          .then((embedMessage) => {
            answersWithEmojis.forEach((reaction, i) =>
              embedMessage.react(emojis[i])
            )
            database.watch(embedMessage, pollId, 30000)
          })
          .then(() => {
            message.delete()
          })
      })
  }
})

client.login(config.BOT_TOKEN)
