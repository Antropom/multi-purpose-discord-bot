const Discord = require('discord.js')
const { rollotron } = require('./functions/rollotron')
const { poll } = require('./functions/poll')
const { PollDatabase } = require('./functions/poll-database')
const { foissSlurs } = require('./functions/foissSlurs')
const config = require('./config.json')
const client = new Discord.Client()

const prefix = '!'
let database = new PollDatabase()

client.once('ready', () => {
  database.sync()
})

client.on('messageReactionAdd', (reaction, user) => {
  database.update(reaction, user, 'add')
})
client.on('messageReactionRemove', (reaction, user) => {
  database.update(reaction, user, 'remove')
})

client.on('message', function (message) {
  if (message.author.bot) return

  const commandBody = message.content.slice(prefix.length)
  const args = commandBody.split(' ')
  const command = args.shift().toLowerCase()

  if (message.content.startsWith(`${prefix}roll`)) {
    rollotron(message, args)
  }

  const foissNames = ['foiss', 'pierre', 'foissac']
  if (foissNames.some((name) => message.content.toLowerCase().includes(name))) {
    foissSlurs(message)
  }

  if (message.content.startsWith(`${prefix}sondage`)) {
    poll(message, commandBody, database, Discord)
  }
})

client.login(config.BOT_TOKEN)
