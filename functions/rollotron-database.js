const Sequelize = require('sequelize')

exports.RollotronDatabase = class RollotronDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      'rollotron',
      '8RS+eq$EBwnX3k2W',
      '9u58bvMbqBe@*ZLc',
      {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
      }
    )

    this.macros = this.sequelize.define('macros', {
      user: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      macro: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    })
  }

  sync = () => {
    this.macros.sync()
  }

  load = async (authorId, macro) => {
    const loadMacro = await this.macros.findOne({
      where: { user: authorId, macro: macro },
    })
    return loadMacro ? loadMacro.value : null
  }

  save = async (authorId, macro, value) => {
    const updateMacro = await this.macros.findOne({
      where: { user: authorId, macro: macro },
    })
    if (updateMacro) {
      updateMacro.value = value
      await updateMacro.save()
      return updateMacro.id
    } else {
      try {
        const newMacro = await this.macros.create({
          user: authorId,
          macro: macro,
          value: value,
        })
        return newMacro.id
      } catch (e) {
        console.error(e)
      }
      return -1
    }
  }

  remove = async (authorId, macro) => {
    const removeMacro = await this.macros.findOne({
      where: { user: authorId, macro: macro },
    })
    if (removeMacro) {
      await removeMacro.destroy()
      return true
    }
    return false
  }

  findAll = async (authorId) => {
    const macros = await this.macros.findAll({
      where: { user: authorId },
    })
    return macros
  }
}
