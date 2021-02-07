exports.rollotron = async (message, args, database, Discord) => {
  const {
    channel,
    author: { id: authorId, username },
  } = message

  const reserved = ['i', 'indiv', 'l', 'list', 'h', 'help']

  let macro = args && args.length > 0 ? args[0] : null
  if (
    macro &&
    !reserved.includes(macro) &&
    isNaN(macro[0]) &&
    (macro[0] !== 'd' || (macro.length > 1 && isNaN(macro[1])))
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
  if (!args || args.length < 1) {
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
  } else if (args[0] === 'h' || args[0] === 'help') {
    const doc = new Discord.MessageEmbed().setColor('#0099ff').addFields({
      name: 'Les dés',
      value:
        'Afin de lancer un dé, utiliser la commande `!roll`.\n Pour lancer plusieurs dés, rajouter le paramètre `xdy`, où x et y sont des nombres. Exemple: `!roll 2d20` pour lancer 2 D20. Le paramètre `xdy` peut être répété plusieurs fois afin de lancer des dés de valeurs différentes. \n Pour ajouter un **modificateur**, renseigner `$x` après le jet, où $ est `+`, `-` ou `*` et x est un nombre. Exemple: `!roll 2d8+2` pour lancer 2 D8 et y ajouter 2. \n Pour **répéter** un lancé de dès, ajouter `rx` après le jet, où x est un nombre. Exemple: `!roll i 3d6r4` pour lancer 4 fois 3 D6. \n Pour faire des jets de dès **individuels**, utiliser la commande `i`. Exemple: `!roll i 2d6 1d8` pour les scores de 2 D6 et 1 D8 indépendamment. \n Pour enregistrer ou modifier une **macro**, ajouter le nom de la macro avant le jet de dés. Exemple: `!roll bsword 2D12+4`. \n Pour exécuter une macro, il suffit de la nommer. Exemple: `!roll bsword` \n Pour supprimer une macro, il faut préfixer son nom par un `!`. Exemple: `!roll !bsword`.',
    })
    message.author.send(doc)
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
        if (dices.length > 1) {
          result.push(`(${dices.join(', ')})${modifier} = ${sum}`)
        } else {
          result.push(`${dices[0]}${modifier} = ${sum}`)
        }
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
        if (dices.length > 1) {
          result.push(`(${dices.join(', ')})${modifier}`)
        } else {
          result.push(`${dices[0]}${modifier}`)
        }
      }
    }
    return indiv ? result.join('\n') : result.join(', ')
  })

  let result = ''
  if (indiv) {
    result += `${username} rolls:\n${rolls.join('\n')}`
  } else {
    rolls = rolls.join(' + ')
    result +=
      rolls.includes(',') || rolls.includes('+')
        ? `${username} rolls ${rolls}\nTotal ${total}`
        : `${username} rolls ${rolls}`
  }

  channel.send(result)
}
