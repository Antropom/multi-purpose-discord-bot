const Discord = require('discord.js')
const Sequelize = require('sequelize')
const config = require('../config.json')
exports.ReminderDatabase = class ReminderDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      'reminder',
      config.REMINDER_DB_NAME,
      config.REMINDER_DB_PASSWORD
    )
  }
}
