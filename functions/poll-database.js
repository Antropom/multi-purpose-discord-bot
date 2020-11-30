const Discord = require('discord.js')
const Sequelize = require('sequelize')

exports.PollDatabase = class PollDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      'discordbot',
      'discordbot',
      'beeboop@foiss!',
      {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
      }
    )

    this.polls = this.sequelize.define('polls', {
      messageId: {
        type: Sequelize.INTEGER,
        unique: true,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answers: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      votes: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    })
  }

  sync = () => {
    this.polls.sync()
  }

  create = async (message, question, answers) => {
    const {
      author: { id: authorId, username: authorName },
    } = message
    try {
      const poll = await this.polls.create({
        user: authorId,
        userName: authorName,
        question: question,
        answers: JSON.stringify(answers),
        votes: JSON.stringify({
          '🇦': [],
          '🇧': [],
          '🇨': [],
          '🇩': [],
          '🇪': [],
          '🇫': [],
        }),
      })
      return poll.id
    } catch (e) {
      console.error(e)
    }
    return -1
  }

  setMessageId = async (pollId, messageId) => {
    const poll = await this.polls.findOne({
      where: { id: pollId },
    })
    poll.messageId = messageId
    await poll.save()
  }

  update = async (reaction, user, action) => {
    const emojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫']
    const {
      message: {
        id: messageId,
        author: { id: authorId },
      },
      emoji: { name: emojiName },
    } = reaction
    if (!emojis.includes(emojiName)) {
      return
    }
    const { id: userId } = user
    const poll = await this.polls.findOne({
      where: { messageId: messageId },
    })
    if (poll && userId !== authorId) {
      this.toggleReaction(poll, emojiName, userId, action)
      const votes = JSON.parse(poll.votes)
      const answers = JSON.parse(poll.answers)
        .map((answer) => {
          const vote = answer.split(' ')[0]
          if (votes[vote].length) {
            return `${answer} (${votes[vote]
              .map((id) => `<@!${id}>`)
              .join(',')})`
          } else {
            return `${answer}`
          }
        })
        .join('\n')
      const pollEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Sondage #${poll.id} de ${poll.userName}`)
        .addFields({
          name: poll.question,
          value: answers,
        })
        .setTimestamp()

      reaction.message.edit(pollEmbed)
    }
  }

  async toggleReaction(poll, vote, userID, action) {
    const votes = JSON.parse(poll.votes)
    if (action === 'add') {
      votes[vote] = [userID, ...votes[vote]]
    } else {
      votes[vote] = [...votes[vote].filter((id) => id !== userID)]
    }
    poll.votes = JSON.stringify(votes)
    await poll.save()
  }
}
