// jsdoc --readme Documentation-Landing-Page.md index.js

var Config = require('config-js')
var devConf = true
var config

if (devConf) {
  config = new Config('./config_dev.js')
} else {
  config = new Config('./config.js')
}

console.log('======== dudebro v0.2.0 build 90 ========')

// import the discord.js module
const Discord = require('discord.js')

// create an instance of a Discord Client, and call it client
const client = new Discord.Client()

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.get('bot.token')

// defining fueldudes variables
var standbyList = [] // array that keeps track of pilots on duty. the bot uses
                     // this array to contact available pilots that the bot can
                     // directly request assistance from

var fuelClientID = null          // id for the client reveiving assistance
var fuelClientName = null        // CMDR name of the client
var fuelClientSystem = null      // client's current system
var fuelClientRealm = null       // client's platform (i.e. xbox)
var fuelClientLifeSupport = null // boolean determining whether the client is
                                 // using life support oxygen
var fuelClientSection = null     // SECTION LIST:
                                 // 1 === in-game name
                                 // 2 === system name
                                 // 3 === platform
                                 // 4 === life support
                                 // 5 === confirm
var fuelClientIsConfirming = null
var fuelClientState = 0          // for reference: 1 == info collection,
                                 // 2 == fueldude dispatch mode, 0 == standby

// miscellaneous variables
var ripList = []
ripList = config.get('bot.ripList')
var ripPick = 0 // keeps track of which part of the ripList has been used

// the ready event is vital, it means that your bot will only start reacting to
// information from Discord _after_ ready is emitted.
client.on('ready', () => {
  console.log('Connection to Discord established.')
  client.user.setPresence({
    status: 'online',
    afk: false
  })
  console.log('Presence set.')
  client.guilds.get(config.get('bot.lexid')).member(config.get('bot.id')).setNickname('[STBY] ' + config.get('bot.nick'))
})

// ================ Custom Functions ================ //

function resetState () {
  fuelClientID = null
  fuelClientName = null
  fuelClientSystem = null
  fuelClientRealm = null
  fuelClientLifeSupport = null
  fuelClientSection = null
  fuelClientState = 0
}

// =============== Bot Event Listener =============== //

// create an event listener for messages
client.on('message', message => {
  console.log(message.createdAt + ' <' + message.channel.name + '> ' + message.member.displayName + ': ' + message.content)

  try {
    if (message.channel.name === config.get('bot.lexchan')) {
    // These commands are limited to the #fueldudes channel.

      if (!message.member.roles.findKey('name', 'Fuel Dudes')) {
        /**
          * Register as a Fuel Dude. Registering will add the Fuel Dude role to
          * your Discord account, and Dispatcher Bot will be able to mention you with the role.
          *
          * @name !register
          * @see !unregister
          */
        if (message.content === '!register') {
          let fuelDudes = message.guild.roles.find('name', 'Fuel Dudes')
          message.member.addRole(fuelDudes)
          reply(message, 'You are now registered as a **Fuel Dude**! Fly safe, commander. o7')
        }
      }

      if (message.member.roles.findKey('name', 'Fuel Dudes')) {
        // commands and lexicon replies specific for Fuel Dude pilots

        /**
          * Unregister as a Fuel Dude. This will remove the Fuel Dude role from
          * your Discord account.
          *
          * @name !unregister
          * @see !register
          */
        if (message.content === '!unregister') {
          let fuelDudes = message.guild.roles.find('name', 'Fuel Dudes')
          message.member.removeRole(fuelDudes)
          reply(message, 'You are no longer registered as a Fuel Dude. We hope to have your assistance again soon.')
        }
      }
    }

    if (message.content === 'ping') {
      // send "pong" to the same channel.
      // reply(message, "pong! :ping_pong:")
      message.reply('PONG! :ping_pong:')
    }

    if (message.content === 'roleID()') {
      console.log(message.guild.roles)
      reply(message, 'Check the console log for the roles and their IDs.')
    }

    if (message.content === 'isRegisteredPilot()') {
      var registered = message.member.roles.exists('name', 'Fuel Dudes')
      if (registered) reply(message, 'You are registered as a Fuel Dude pilot! :smile:')
      if (!registered) reply(message, 'You are not registered as a Fuel Dude pilot. :frowning2:')
    }

    if (message.content === 'logout()' && message.user.id === config.get('bot.owner')) {
      reply(message, ':wave:')
      client.destroy()
    }

    if (message.content === 'testGreen()') {
      var editRole = message.guild.roles.findKey('Fuel Dudes')
      console.log(message.guild.roles.get('Fuel Dudes'))
    }

    if (message.content === 'rip') {
      message.delete()
      message.channel.sendMessage('rest in ' + ripList[ripPick])
      ripPick++
      if (ripPick >= ripList.length) ripPick = 0
    }
  } catch (error) {
    message.channel.sendMessage('Whoops! That didn\'t work. Here\'s the error shenanigans:\n\n' + error + '\n\nCC <@!' + config.get('bot.owner') + '>')
  }
})

// log our bot in
client.login(token)
