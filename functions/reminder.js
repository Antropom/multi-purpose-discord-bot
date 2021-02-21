exports.reminder = async (message, commandBody, database, Discord) => {
  const args = commandBody.split(',')
  const mention =
    message.mentions.users.first() || message.mentions.roles.first()
  const date = args[1]
  const text = args[2]

  const eventId = await database.create(message, mention.id, date, text)
  message.channel.send(`Rappel créé avec l'id : ${eventId}`)
}
