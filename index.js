const Discord = require('discord.js')
const { documentation } = require('./functions/documentation')
const { rollotron } = require('./functions/rollotron')
const { poll } = require('./functions/poll')
const { moneytron } = require('./functions/moneytron')
const { reminder, toRemind } = require('./functions/reminder')
const { PollDatabase } = require('./functions/poll-database')
const { RollotronDatabase } = require('./functions/rollotron-database')
const { MoneytronDatabase } = require('./functions/moneytron-database')
const { ReminderDatabase } = require('./functions/reminder-database')
const { foissSlurs } = require('./functions/foissSlurs')
const config = require('./config.json')
const client = new Discord.Client()
const CronJob = require('cron').CronJob

const prefix = '!'
let pollDatabase = new PollDatabase()
let rollotronDatabase = new RollotronDatabase()
let moneytronDatabase = new MoneytronDatabase()
let reminderDatabase = new ReminderDatabase()

client.once('ready', () => {
  pollDatabase.sync()
  rollotronDatabase.sync()
  moneytronDatabase.sync()
  reminderDatabase.sync()
  client.user.setActivity('!help pour la doc', { type: 'LISTENING' })
})

client.on('messageReactionAdd', (reaction, user) => {
  pollDatabase.update(reaction, user, 'add')
})
client.on('messageReactionRemove', (reaction, user) => {
  pollDatabase.update(reaction, user, 'remove')
})

const cronReminder = new CronJob(
  '* * * * * *',
  () => {
    toRemind(client.channels.cache, reminderDatabase)
  },
  null
)
cronReminder.start()

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

  if (
    message.content.startsWith(`${prefix}roll `) ||
    message.content.startsWith(`${prefix}r `) ||
    message.content === `${prefix}roll` ||
    message.content === `${prefix}r`
  ) {
    rollotron(message, args, rollotronDatabase, Discord)
  }

  if (
    message.content.startsWith(`${prefix}money `) ||
    message.content.startsWith(`${prefix}m `) ||
    message.content === `${prefix}money` ||
    message.content === `${prefix}m`
  ) {
    moneytron(message, args, moneytronDatabase, Discord)
  }

  if (message.content.startsWith(`${prefix}rappel`)) {
    reminder(message, commandBody, reminderDatabase).then((res) => {
      res !== 'error'
        ? message.author.send(res)
        : message.author.send(
            'Ta requête est mal formulée. Envoie-moi `!help` pour voir les instructions.'
          )
    }).then(() => message.delete())
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
