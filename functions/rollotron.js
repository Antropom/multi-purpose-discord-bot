exports.rollotron = (message, args) => {
  const {
    channel,
    author: { username },
  } = message

  if (!args.length) {
    args.push('6')
  }
  let total = 0
  const rolls = args
    .map((arg) => {
      let n = 1
      arg = arg.toLowerCase()
      if (arg.includes('d'))  {
        n = arg.split('d')[0] ? arg.split('d')[0] : 1
        arg = arg.split('d')[1]
        console.log('test');
      }
      const dices = []
      for (let i = 0; i < n; i++) {
        if (isNaN(parseInt(arg))) {
          return `[${arg} is unknown]`
        }
        const value = parseInt(arg)
        const roll = Math.floor(1 + Math.random() * (value))
        total += roll
        dices.push(roll)
      }
      if (dices.length > 1) {
        return `(${dices.join(', ')})`
      } else {
        return dices[0]
      }
    })
    .join(' + ')

  channel.send(`${username} rolls ${rolls}. Total: ${total}`)
}
