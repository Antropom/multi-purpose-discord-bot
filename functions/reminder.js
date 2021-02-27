const reminder = async (message, commandBody, database) => {
  const args = commandBody.split(',')
  const mention =
    message.mentions.users.first() || message.mentions.roles.first()
  const date = args[1].trim().split(' ')
  const dateArray = []
  dateArray.push(date[0].split('/').reverse().join('-'))
  dateArray.push(date[1].replace('h', ':'))
  const formattedDate = dateArray.join(' ')
  const text = args[2].trim()

  return (eventId = await database.create(
    message,
    mention.id,
    formattedDate,
    text
  ))
}

const toRemind = async (channel, database) => {
  const res = await database.getNotReminded()
  const now = Date.now()
  res.forEach((reminder) => {
    const reminderDate = reminder.date.valueOf()
    if (reminderDate < now) {
      const mentionString = '<@!' + reminder.name + '>'
      channel
        // À changer, ne pas laisser en dur !!!!!
        .get('813065114419986452')
        .send(`${mentionString} ${reminder.message}`)
      database.hasBeenReminded(reminder.id)
    }
  })
}

module.exports = {
  reminder,
  toRemind,
}
