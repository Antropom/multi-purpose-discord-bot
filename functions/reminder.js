exports.reminder = async (message, commandBody, database, Discord) => {
  const args = commandBody.split(',')
  const mention =
    message.mentions.users.first() || message.mentions.roles.first()
  const date = args[1].trim().split(' ')
  const dateArray = []
  dateArray.push(date[0].split('/').reverse().join('-'))
  dateArray.push(date[1].replace('h', ':'))
  const formattedDate = dateArray.join(' ')
  const text = args[2].trim()

  const eventId = await database.create(
    message,
    mention.id,
    formattedDate,
    text
  )

  message.channel.send(`Rappel créé avec l'id : ${eventId}`)
}
