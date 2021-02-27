const Discord = require('discord.js')
const Sequelize = require('sequelize')
const config = require('../config.json')

exports.ReminderDatabase = class ReminderDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      'reminderdb',
      config.REMINDER_USER_NAME,
      config.REMINDER_DB_PASSWORD,
      {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
      }
    )

    this.reminder = this.sequelize.define('reminder', {
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hasReminded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
    })
  }

  sync = () => {
    this.reminder.sync()
  }

  create = async (message, name, date, text) => {
    const {
      author: { id: authorId },
    } = message
    try {
      const reminder = await this.reminder.create({
        user: authorId,
        name: name,
        date: date,
        message: text,
      })
      return reminder.id
    } catch (e) {
      console.error(e)
    }
  }

  getNotReminded = async () => {
    try {
      const eventResults = await this.reminder.findAll({
        where: { hasReminded: false },
      })
      return eventResults.reduce((a, b) => {
        a.push(b.dataValues)
        return a
      }, [])
    } catch (e) {
      console.error(e)
    }
  }

  hasBeenReminded = async (id) => {
    try {
      return await this.reminder.update(
        {
          hasReminded: 1,
        },
        {
          where: {
            id: id,
          },
        }
      )
    } catch (e) {
      console.error(e)
    }
  }
}
