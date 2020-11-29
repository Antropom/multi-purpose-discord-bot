const Sequelize = require('sequelize')
const {
  DATABASE_NAME,
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
} = require('./config.dev.json')
const WATCH_DURATION = 10000

exports.PollDatabase = class PollDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      DATABASE_NAME,
      DATABASE_USER,
      DATABASE_PASSWORD,
      {
        host: DATABASE_HOST,
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
      }
    )

    this.polls = this.sequelize.define('polls', {
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answer1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answer2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answer3: Sequelize.STRING,
      answer4: Sequelize.STRING,
      answer5: Sequelize.STRING,
      answer6: Sequelize.STRING,
    })
    console.log('connect')
  }

  sync = () => {
    this.polls.sync()
    console.log('sync')
  }

  create = async (user, question, answers) => {
    try {
      const poll = await this.polls.create({
        user: user,
        question: question,
        answer1: answers[0],
        answer2: answers[1],
        answer3: answers[2] ? answers[2] : null,
        answer4: answers[3] ? answers[3] : null,
        answer5: answers[4] ? answers[4] : null,
        answer6: answers[5] ? answers[5] : null,
        vote1: JSON.stringify([]),
        vote2: JSON.stringify([]),
        vote3: JSON.stringify([]),
        vote4: JSON.stringify([]),
        vote5: JSON.stringify([]),
        vote6: JSON.stringify([]),
      })
      return poll.id
    } catch (e) {
      console.error(e)
    }
    return -1
  }

  watch = (message, pollId, duration) => {
    if (duration <= 0) {
      console.log('stop watch')
      // TODO show poll result
      return
    }
    console.log('watch')
    const filter = (reaction, user) => {
      return (
        ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫'].includes(reaction.emoji.name) &&
        user.id !== message.author.id
      )
    }
    message
      .awaitReactions(filter, { time: WATCH_DURATION })
      .then((collected) => {
        collected.map((reaction) => console.log(reaction))
        this.watch(message, pollId, duration - WATCH_DURATION)
      })
      .catch(() => {
        console.log('no reactions')
        this.watch(message, pollId, duration - WATCH_DURATION)
      })
  }
}
