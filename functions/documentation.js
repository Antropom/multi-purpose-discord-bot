const { Channel } = require('discord.js')

exports.documentation = (message, Discord) => {
  const doc = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Documentation')
    .setAuthor('Antropomorphine & Conradson')
    .setDescription(
      "Présentation des différentes commandes d'utilisation du bot"
    )
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/782290461099556914/782301136714858496/connard-de-bot.png'
    )
    .addFields(
      { name: '\u200B', value: '\u200B' },
      {
        name: 'Sondage',
        value:
          'Pour lancer un sondage, utiliser la commande `!sondage` suivi par une question entre `""` et les réponses sous la même forme. \n Par exemple: `!sondage "Question" "Réponse 1" "Réponse 2"` \n Attention, au maximum seules six réponses sont possibles.',
      },
      {
        name: 'Les dés',
        value:
          "Afin de lancer un dé, utiliser la commande `!roll`. Si aucun autre paramètre n'est fourni, seul un D6 sera lancé. \n Pour lancer plusieurs dés, rajouter le paramètre `xdy`, où x et y sont des nombres. Exemple: `!roll 2d20` pour lancer 2 D20. Le paramètre `xdy` peut être répété plusieurs fois afin de lancer des dés de valeurs différentes. \n Pour plus d'information utiliser la commande `!roll help`",
      }
    )

  message.author.send(doc)
}
