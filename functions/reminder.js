const reminder = async (message, commandBody, database) => {
  const args = commandBody.split(',')

  if (args.length < 2) {
    return 'error'
  }

  const mention = []
  mention[0] = message.mentions.users.first() || message.mentions.roles.first()
  mention[1] = message.mentions.users.first() ? 'user' : 'role'

  const date = args[1].trim().split(' ')
  const dateArray = []
  dateArray.push(date[0].split('/').reverse().join('-'))
  dateArray.push(date[1].replace('h', ':'))
  const formattedDate = dateArray.join(' ')

  if (
    new Date(formattedDate) instanceof Date &&
    !isNaN(new Date(formattedDate).valueOf())
  ) {
    const text = args[2] ? args[2].trim() : ''
    return database.create(message, mention, formattedDate, text)
  } else {
    return 'error'
  }
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
