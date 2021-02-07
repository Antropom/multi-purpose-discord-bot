const Sequelize = require('sequelize')

exports.MoneytronDatabase = class MoneytronDatabase {
  constructor() {
    this.connect()
  }

  connect = () => {
    this.sequelize = new Sequelize(
      'moneytron',
      'R86F4{Q3B?e7~@8d',
      'mkYM$dnt?jn*;R3^',
      {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
      }
    )

    this.wallet = this.sequelize.define('wallet', {
      user: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ep: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      gp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    })
  }

  sync = () => {
    this.wallet.sync()
  }

  load = async (authorId) => {
    let wallet = await this.wallet.findOne({
      where: { user: authorId },
    })
    if (!wallet) {
      wallet = await this.wallet.create({
        user: authorId,
        cp: 0,
        sp: 0,
        ep: 0,
        gp: 0,
        pp: 0,
      })
    }
    return wallet
  }

  set = async (authorId, amount) => {
    const wallet = await this.load(authorId)
    for (const type of amount.split(' ')) {
      const value = parseInt(type.replace(/\D/g, ''))
      if (type.endsWith('pp')) {
        wallet.pp = value
      } else if (type.endsWith('gp') || type.endsWith('po')) {
        wallet.gp = value
      } else if (type.endsWith('ep') || type.endsWith('pe')) {
        wallet.ep = value
      } else if (type.endsWith('sp') || type.endsWith('pa')) {
        wallet.sp = value
      } else if (type.endsWith('cp') || type.endsWith('pc')) {
        wallet.cp = value
      }
    }
    await wallet.save()
    return wallet
  }

  convertWalletCP(wallet) {
    return (
      wallet.pp * 1000 +
      wallet.gp * 100 +
      wallet.ep * 50 +
      wallet.sp * 10 +
      wallet.cp
    )
  }

  convertAmountToCP(amount) {
    let total = 0
    for (const type of amount.split(' ')) {
      const value = parseInt(type.replace(/\D/g, ''))
      if (type.endsWith('pp')) {
        total += value * 1000
      } else if (type.endsWith('gp') || type.endsWith('po')) {
        total += value * 100
      } else if (type.endsWith('ep') || type.endsWith('pe')) {
        total += value * 50
      } else if (type.endsWith('sp') || type.endsWith('pa')) {
        total += value * 10
      } else if (type.endsWith('cp') || type.endsWith('pc')) {
        total += value
      }
    }
    return total
  }

  convertAmountToBill(amount) {
    let bill = [0, 0, 0, 0, 0]
    for (const type of amount.split(' ')) {
      const value = parseInt(type.replace(/\D/g, ''))
      if (type.endsWith('pp')) {
        bill[0] = value
      } else if (type.endsWith('gp') || type.endsWith('po')) {
        bill[1] = value
      } else if (type.endsWith('ep') || type.endsWith('pe')) {
        bill[2] = value
      } else if (type.endsWith('sp') || type.endsWith('pa')) {
        bill[3] = value
      } else if (type.endsWith('cp') || type.endsWith('pc')) {
        bill[4] = value
      }
    }
    return bill
  }

  reset = async (authorId) => {
    const wallet = await this.load(authorId)
    wallet.pp = 0
    wallet.gp = 0
    wallet.ep = 0
    wallet.sp = 0
    wallet.cp = 0
    await wallet.save()
    return wallet
  }
}
