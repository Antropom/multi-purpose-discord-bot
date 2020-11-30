exports.foissSlurs = (message) => {
  const slurs = [
    'fripon',
    'pourceau',
    'sagouin',
    'paltoquet',
    'olibrius',
    'cuistre',
    'orchidoclaste',
    'nodocéphale',
    'forban',
    'foutriquet',
    'gaupe',
    'gougnafier',
    'houlier',
    'vil palefrenier',
    'coprophage',
  ]
  const randomSlur = slurs[Math.floor(Math.random() * slurs.length)]
  const pierreId = '267704102073401355'
  let mentionString = '<@!' + pierreId + '>'
  message.channel.send(`${mentionString} est un ${randomSlur} !`)
}
