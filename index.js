const Discord = require('discord.js')
const { documentation } = require('./functions/documentation')
const { rollotron } = require('./functions/rollotron')
const { poll } = require('./functions/poll')
const { PollDatabase } = require('./functions/poll-database')
const { RollotronDatabase } = require('./functions/rollotron-database')
const { foissSlurs } = require('./functions/foissSlurs')
const config = require('./config.json')
const client = new Discord.Client()

const prefix = '!'
let pollDatabase = new PollDatabase()
let rollotronDatabase = new RollotronDatabase()

client.once('ready', () => {
  pollDatabase.sync()
  rollotronDatabase.sync()
  client.user.setActivity('PM !help pour la doc')
})

client.on('messageReactionAdd', (reaction, user) => {
  pollDatabase.update(reaction, user, 'add')
})
client.on('messageReactionRemove', (reaction, user) => {
  pollDatabase.update(reaction, user, 'remove')
})

client.on('message', function (message) {
  if (message.author.bot) return

  const commandBody = message.content.slice(prefix.length)
  const args = commandBody.split(' ')
  const command = args.shift().toLowerCase()

  if (
    message.channel.type === 'dm' &&
    message.content.startsWith(`${prefix}help`)
  ) {
    documentation(message, Discord)
  }

  if (message.content.startsWith(`${prefix}roll`)) {
    rollotron(message, args, rollotronDatabase, Discord)
  }

  const foissNames = ['foiss', 'pierre', 'foissac']
  if (foissNames.some((name) => message.content.toLowerCase().includes(name))) {
    foissSlurs(message)
  }

  if (message.content.startsWith(`${prefix}sondage`)) {
    poll(message, commandBody, pollDatabase, Discord)
  }
})

client.login(config.BOT_TOKEN)
