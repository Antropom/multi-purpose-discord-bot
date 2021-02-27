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

const toRemind = async (message, database) => {
  return (res = await database.getNotReminded())
}

module.exports = {
  reminder,
  toRemind,
}
