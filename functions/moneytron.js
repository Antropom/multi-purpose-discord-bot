exports.moneytron = async (message, args, database, Discord) => {
  const {
    channel,
    author: { id: authorId, username },
  } = message
  let wallet
  if (!args || args.length < 1) {
    wallet = await database.load(authorId)
  } else if (args[0] === 'reset' || args[0] === 'r') {
    wallet = await database.reset(authorId)
  } else if (args[0] === 'gain' || args[0] === 'g') {
    args.shift()
    wallet = await database.gain(authorId, args.join(' ').toLowerCase())
  } else if (args[0] === 'pay' || args[0] === 'p') {
    args.shift()
    try {
      const { paid, change, update } = await database.pay(
        authorId,
        args.join(' ').toLowerCase()
      )
      channel.send(
        `${paidContent(
          readableWallet(paid),
          readableWallet(change),
          username
        )}\n${walletContent(readableWallet(update), username)}`
      )
    } catch (error) {
      channel.send(`${username} n'a pas assez d'argent.`)
    }
    return
  } else {
    wallet = await database.set(authorId, args.join(' ').toLowerCase())
  }
  channel.send(walletContent(readableWallet(wallet), username))
}

const readableWallet = (wallet) => {
  let total = []
  if (wallet.pp > 0) {
    total.push(`${wallet.pp}:medal:`)
  }
  if (wallet.gp > 0) {
    total.push(`${wallet.gp}:first_place:`)
  }
  if (wallet.ep > 0) {
    total.push(`${wallet.ep}:military_medal:`)
  }
  if (wallet.sp > 0) {
    total.push(`${wallet.sp}:second_place:`)
  }
  if (wallet.cp > 0) {
    total.push(`${wallet.cp}:third_place:`)
  }
  return total
}

const walletContent = (currency, username) => {
  let result = `Le porte-monnaie de ${username} est vide.`
  if (currency.length > 0) {
    result = `Le porte-monnaie de ${username} contient :\n${currency.join(
      ', '
    )}`
  }
  return result
}

const paidContent = (paid, change, username) => {
  let result = `${username} a payé : ${paid.join(', ')}`
  if (change.length) {
    result += ` et a reçu : ${change.join(', ')}`
  }
  return result
}
