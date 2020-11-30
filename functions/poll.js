exports.poll = (message, commandBody, database, Discord) => {
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

  database.create(message, questionTitle, answersWithEmojis).then((pollId) => {
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
        database.setMessageId(pollId, embedMessage.id)
      })
      .then(() => {
        message.delete()
      })
  })
}
