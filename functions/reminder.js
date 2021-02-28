const reminder = async (message, commandBody, database) => {
  const args = commandBody.split(',')
  const mention = []
  mention[0] = message.mentions.users.first() || message.mentions.roles.first()
  if (message.mentions.users.first()) {
    mention[1] = 'user'
  } else if (message.mentions.roles.first()) {
    mention[1] = 'role'
  }
  const date = args[1].trim().split(' ')
  const dateArray = []
  dateArray.push(date[0].split('/').reverse().join('-'))
  dateArray.push(date[1].replace('h', ':'))
  const formattedDate = dateArray.join(' ')
  const text = args[2].trim()

  return database.create(message, mention, formattedDate, text)
}

const toRemind = async (channel, database) => {
  const res = await database.getNotReminded()
  if (res) {
    const now = Date.now()
    res.forEach((reminder) => {
      const reminderDate = reminder.date.valueOf()
      if (reminderDate < now) {
        const mentionString =
          reminder.mentionType === 'user'
            ? '<@!' + reminder.name + '>'
            : reminder.mentionType === 'role'
            ? '<@&' + reminder.name + '>'
            : ''
        channel
          .get(reminder.channel)
          .send(`${mentionString} ${reminder.message}`)
        database.hasBeenReminded(reminder.id)
      }
    })
  }
}

module.exports = {
  reminder,
  toRemind,
}
