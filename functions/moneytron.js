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
  } else {
    wallet = await database.set(authorId, args.join(' ').toLowerCase())
  }
  channel.send(walletContent(wallet, username))
}

const walletContent = (wallet, username) => {
  let total = []
  let result = `Le porte-monnaie de ${username} est vide.`
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
  if (total.length > 1) {
    result = `Le porte-monnaie de ${username} contient:\n${total.join(', ')}`
  }
  return result
}
