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

  gain = async (authorId, amount) => {
    const wallet = await this.load(authorId)
    const bill = this.convertAmountToBill(amount)
    wallet.pp += bill.pp
    wallet.gp += bill.gp
    wallet.ep += bill.ep
    wallet.sp += bill.sp
    wallet.cp += bill.cp
    await wallet.save()
    return wallet
  }

  pay = async (authorId, amount) => {
    const wallet = await this.load(authorId)
    const stash = {
      pp: wallet.pp,
      gp: wallet.gp,
      ep: wallet.ep,
      sp: wallet.sp,
      cp: wallet.cp,
    }
    const money = this.convertWalletToCopper(stash)
    const total = this.convertAmountToCopper(amount)

    if (total > money) {
      throw new Error('Not enough money')
    }
    const bill = this.convertAmountToBill(amount)
    const paid = {
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    }
    // pay what you can
    paid.pp += Math.min(bill.pp, stash.pp)
    stash.pp -= paid.pp
    paid.gp += Math.min(bill.gp, stash.gp)
    stash.gp -= paid.gp
    paid.ep += Math.min(bill.ep, stash.ep)
    stash.ep -= paid.ep
    paid.sp += Math.min(bill.sp, stash.sp)
    stash.sp -= paid.sp
    paid.cp += Math.min(bill.cp, stash.cp)
    stash.cp -= paid.cp

    while (
      this.convertWalletToCopper(bill) > this.convertWalletToCopper(paid)
    ) {
      if (stash.cp > 0) {
        paid.cp += stash.cp
        stash.cp = 0
      } else if (stash.sp > 0) {
        paid.sp += stash.sp
        stash.sp = 0
      } else if (stash.ep > 0) {
        paid.ep += stash.ep
        stash.ep = 0
      } else if (stash.gp > 0) {
        paid.gp += stash.gp
        stash.gp = 0
      } else if (stash.pp > 0) {
        paid.pp += stash.pp
        stash.pp = 0
      }
    }
    let diff =
      this.convertWalletToCopper(paid) - this.convertWalletToCopper(bill)
    const change = {
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    }
    change.gp = Math.floor(diff / 100)
    diff -= change.gp * 100
    change.sp = Math.floor(diff / 10)
    diff -= change.sp * 10
    change.cp = diff

    // remove change overflow
    if (paid.cp > 0 && change.cp > 0) {
      if (paid.cp > change.cp) {
        paid.cp = paid.cp - change.cp
        change.cp = 0
      } else {
        change.cp = change.cp - paid.cp
        paid.cp = 0
      }
    }
    if (paid.sp > 0 && change.sp > 0) {
      if (paid.sp > change.sp) {
        paid.sp = paid.sp - change.sp
        change.sp = 0
      } else {
        change.sp = change.sp - paid.sp
        paid.sp = 0
      }
    }
    if (paid.gp > 0 && change.gp > 0) {
      if (paid.gp > change.gp) {
        paid.gp = paid.gp - change.gp
        change.gp = 0
      } else {
        change.gp = change.gp - paid.gp
        paid.gp = 0
      }
    }

    wallet.pp = wallet.pp - paid.pp + change.pp
    wallet.gp = wallet.gp - paid.gp + change.gp
    wallet.ep = wallet.ep - paid.ep + change.ep
    wallet.sp = wallet.sp - paid.sp + change.sp
    wallet.cp = wallet.cp - paid.cp + change.cp

    await wallet.save()
    return { paid: paid, change: change, update: wallet }
  }

  convertWalletToCopper(wallet) {
    return (
      wallet.pp * 1000 +
      wallet.gp * 100 +
      wallet.ep * 50 +
      wallet.sp * 10 +
      wallet.cp
    )
  }

  convertAmountToCopper(amount) {
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
    let bill = {
      pp: 0,
      gp: 0,
      ep: 0,
      sp: 0,
      cp: 0,
    }
    for (const type of amount.split(' ')) {
      const value = parseInt(type.replace(/\D/g, ''))
      if (type.endsWith('pp')) {
        bill.pp = value
      } else if (type.endsWith('gp') || type.endsWith('po')) {
        bill.gp = value
      } else if (type.endsWith('ep') || type.endsWith('pe')) {
        bill.ep = value
      } else if (type.endsWith('sp') || type.endsWith('pa')) {
        bill.sp = value
      } else if (type.endsWith('cp') || type.endsWith('pc')) {
        bill.cp = value
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
