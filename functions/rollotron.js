exports.rollotron = async (message, args, database) => {
  const {
    channel,
    author: { id: authorId, username },
  } = message

  const reserved = ['i', 'indiv', 'l', 'list']
  // macro
  let macro = args[0]
  if (
    !reserved.includes(macro) &&
    isNaN(macro[0]) &&
    (macro[0] !== 'd' || !isNaN(macro[1]))
  ) {
    if (macro[0] === '!') {
      macro = macro.substring(1)
      const removed = await database.remove(authorId, macro)
      if (!removed) {
        channel.send(`No macro \`${macro}\` found for ${username}`)
      } else {
        channel.send(`${username} removes macro \`${macro}\``)
      }
      return
    }
    args.shift()
    if (args.length) {
      const id = await database.save(authorId, macro, args.join(' '))
      if (id !== -1) {
        channel.send(`${username} adds macro \`${macro}\``)
      } else {
        channel.send(`Error with macro \`${macro}\``)
      }
      return
    } else {
      const values = await database.load(authorId, macro)
      if (!values) {
        channel.send(`No macro \`${macro}\` found for ${username}`)
        return
      } else {
        args = values.split(' ')
      }
    }
  }
  let indiv = false
  if (!args) {
    args.push('6')
  } else if (args[0] === 'i' || args[0] === 'indiv') {
    args.shift()
    indiv = true
  } else if (args[0] === 'l' || args[0] === 'list') {
    const macros = await database.findAll(authorId)
    if (macros && macros.length > 0) {
      channel.send(
        `${username} macros:\n${macros
          .map((macro) => {
            return `• \`${macro.macro}\` ${macro.value}`
          })
          .join('\n')}`
      )
    } else {
      channel.send(`${username} has no macro`)
    }
    return
  }

  let total = 0
  let rolls = args.map((arg) => {
    let prefix = 1
    if (arg.includes('d')) {
      if (arg[0] === 'd') {
        arg = arg.substring(1)
      } else {
        prefix = !isNaN(arg.split('d')[0]) ? arg.split('d')[0] : 1
        arg = arg.split('d')[1]
      }
    }
    let value = ''
    while (arg.length > 0 && !isNaN(arg[0])) {
      value = `${value}${arg[0]}`
      arg = arg.substring(1)
    }
    value = parseInt(value)
    let suffix = arg
    let repeat = 1
    let modType = null
    let modValue = null
    if (
      suffix[0] === '+' ||
      suffix[0] === '-' ||
      suffix[0] === '*' ||
      suffix[0] === 'x'
    ) {
      modType = suffix[0]
      if (modType === '*') {
        modType = 'x'
      }
      suffix = suffix.substring(1)
      let mod = ''
      while (suffix.length && !isNaN(suffix[0])) {
        mod = `${mod}${suffix[0]}`
        suffix = suffix.substring(1)
      }
      modValue = isNaN(mod) ? 0 : parseInt(mod)
    }
    if (suffix[0] === 'r') {
      suffix = suffix.substring(1)
      repeat = isNaN(suffix) ? 1 : parseInt(suffix)
    }
    let result = []
    for (let r = 0; r < repeat; r++) {
      const dices = []
      for (let i = 0; i < prefix; i++) {
        if (isNaN(value)) {
          return `[${value} is unknown]`
        }
        const roll = Math.floor(1 + Math.random() * value)
        total += roll
        dices.push(roll)
      }
      if (dices.length > 1) {
        if (indiv) {
          let sum = dices.reduce((acc, v) => (acc += v))
          let modifier = ''
          if (modType === '+' || modType === '-' || modType === 'x') {
            if (modType === '+') {
              sum += modValue
            } else if (modType === '-') {
              sum = Math.max(0, sum - modValue)
            } else {
              sum *= modValue
            }
            modifier = `${modType}${modValue}`
          }
          result.push(`(${dices.join(', ')})${modifier} = ${sum}`)
        } else {
          let modifier = ''
          if (modType === '+' || modType === '-' || modType === 'x') {
            if (modType === '+') {
              total += modValue
            } else if (modType === '-') {
              total = Math.max(0, total - modValue)
            } else {
              total *= modValue
            }
            modifier = `${modType}${modValue}`
          }
          result.push(`(${dices.join(', ')})${modifier}`)
        }
      } else {
        result.push(dices[0])
      }
    }
    return indiv ? result.join('\n') : result.join(', ')
  })

  let result = ''
  if (indiv) {
    result = `${username} rolls:\n${rolls.join('\n')}`
  } else {
    rolls = rolls.join(' + ')
    result =
      rolls.includes(',') || rolls.includes('+')
        ? `${username} rolls ${rolls}\nTotal ${total}`
        : `${username} rolls ${rolls}`
  }

  channel.send(result)
}
