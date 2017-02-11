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

function instructions (instructionSet) {
  if (instructionSet === 1) return 'What is your in-game name?'
  if (instructionSet === 2) return 'Which system are you located in?'
  // if (instructionSet === 3) return 'Which platform do you use? `PC`, `Xbox`, and `PS4` are valid answers.'
  if (instructionSet === 3) return 'Which platform do you use? `PC` and `Xbox` are valid answers.'
  if (instructionSet === 4) return 'Are you using reserve oxygen (blue timer in the top right)? `yes` and `no` are valid answers.'
  if (instructionSet === 5) return 'Below is the information that I have collected from you.\n```\n(1) Name: ' + fuelClientName + '\n(2) System: ' + fuelClientSystem + '\n(3) Platform: ' + fuelClientRealm + '\n(4) Using O2 reserve: ' + fuelClientLifeSupport + '\n```\n**If you need to correct any of this information, respond with the corresponding number. Otherwise, respond with `confirm`.**\nOnce you `confirm`, you will not be able to `cancel` fuel rescue through me.\n\nDEBUGGING: `cancel()` will let you cancel if you `confirm`.'
  if (instructionSet === 6) return '\n\n**DUDELERT**\n```\n(1) Name: ' + fuelClientName + '\n(2) System: ' + fuelClientSystem + '\n(3) Platform: ' + fuelClientRealm + '\n(4) Using O2 reserve: ' + fuelClientLifeSupport + '\n```\n**DUDELERT**'
}

// =============== Bot Event Listener =============== //

// create an event listener for messages
client.on('message', message => {
  console.log(message.createdAt + ' <' + message.channel.name + '> ' + message.member.displayName + ': ' + message.content)

  try {
    if (message.channel.name === config.get('bot.lexchan')) {
    // These commands are limited to the #fueldudes channel.

      if (!message.member.roles.findKey('name', 'Fuel Dudes')) {
        // commands specific for users *without* the Fuel Dudes role

        /**
          * Register as a Fuel Dude. Registering will add the Fuel Dude role to
          * your Discord account, and Dispatcher Bot will be able to mention you
          * with the role.
          *
          * @name !register
          * @see !unregister
          */
        if (message.content === '!register') {
          let fuelDudes = message.guild.roles.find('name', 'Fuel Dudes')
          message.member.addRole(fuelDudes)
          message.reply('You are now registered as a **Fuel Dude**! Fly safe, commander. o7')
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
          message.reply('You are no longer registered as a Fuel Dude. We hope to have your assistance again soon.')
        }
      }

      if (fuelClientState !== null) {
        // commands and lexicon specific for fuel rescues

        if (message.member.id === fuelClientID && fuelClientState === 1) {
          // info collection commands

          var invalidResponse = false
          var response = message.content.toLowerCase()

          // parse client responses
          if (fuelClientSection === 1) {
            fuelClientName === message.content
          } else if (fuelClientSection === 2) {
            fuelClientSystem === response
          } else if (fuelClientSection === 3) {
            if (response === 'pc' || response === 'xbox') { // || response === 'ps4'
              fuelClientRealm === response
            } else {
              message.channel.sendMessage('Valid responses are `PC` and `Xbox`. Please try again.')
              invalidResponse === true
            }
          } else if (fuelClientSection === 4) {
            if (response === 'yes' || response === 'no') {
              fuelClientLifeSupport === response
            } else {
              message.channel.sendMessage('Valid responses are `yes` and `no`. Please try again.')
              invalidResponse === true
            }
          } else if (fuelClientSection === 5) {
            fuelClientIsConfirming = true
            if (response === '1' || response === '2' || response === '3' || response === '4') {
              fuelClientSection === parseInt(response)
              invalidResponse = true // so fuelClientSection isn't set to 5
              message.channel.sendMessage(instructions(fuelClientSection))
            } else if (response === 'confirm') {
              fuelClientState = 2
              fuelClientSection = 6
            } else {
              invalidResponse = true
            }
          }

          // send a message with help text if the user gave a valid response.
          // the instructions are handled in the instructions() function.
          if (!invalidResponse) {
            if (fuelClientIsConfirming && fuelClientSection < 6) fuelClientSection === 5
            if (!fuelClientIsConfirming) fuelClientSection++ // progresses
                                                             // client through
                                                             // the information
                                                             // collection
                                                             // process.
            if (fuelClientSection < 6) message.channel.sendMessage(instructions(fuelClientSection))
            if (fuelClientSection === 6) message.channel.sendMessage('<@&' + message.guild.roles.find('name', 'Fuel Dudes').id + '> ' + instructions(fuelClientSection))
          }

          /**
           * Clients have the ability to cancel fuel rescues before they accept
           * their info as correct. There are many reasons why a client would
           * want to cancel their rescue, and we provide this option so that our
           * fuel dudes aren't bothered with empty rescue requests.
           *
           * @name cancel
           * @see help
           */
          if (message.content === 'cancel') {
            console.log('Client cancelled their rescue request. Going ahead with cancellation debriefing now...')
            message.reply('Okay, I have cancelled your fuel request. If this was a mistake or you want to try again, respond with `init`.')
            client.user.setPresence({
              status: 'online',
              afk: false
            })
            console.log('Presense set to online')
            message.guild.member(config.get('bot.id')).setNickname('[STBY] ' + config.get('bot.nick'))
            console.log('Status set to standby')
            resetState()
            console.log('State reset')
            console.log('Cancellation debriefing complete')
          }
        }
      }

      /**
       * This is the distress call. When a user sends this as a message in the
       * #fueldudes channel, the bot will switch to mode 1 (info collection) and
       * proceed to ask the user a few questions.
       *
       * @name help
       * @see cancel
       */
      if (message.content === 'help' && fuelClientID === null || message.content === 'init' && fuelClientID === null) {
        // change bot presence to show busy with a client
        console.log('I have received a fuel rescue request from @' + message.member.nickname + ' (' + message.member.id + ')')
        message.guild.member(config.get('bot.id')).setNickname('[DISP] ' + config.get('bot.nick'))
        console.log('Status set to dispatching')
        message.channel.sendMessage('Hey there, <@!' + message.member.id + '>! Let\'s get you out of trouble.')
        client.user.setPresence({
          status: 'idle',
          afk: true
        })
        console.log('Presence set to DND')

        // save client ID so that the bot only interacts with the client. this
        // will reduce the chance of troll interference.
        fuelClientID = message.member.id
        console.log('Client: ' + fuelClientID)
        fuelClientState = 1
        console.log('STATE UPDATE: Info Collection')
        fuelClientSection = 1
        console.log('Enabled section 1')
        message.channel.sendMessage(instructions(fuelClientSection))
      }
    }

    if (message.content === 'ping') {
      // send "pong" to the same channel.
      // reply(message, "pong! :ping_pong:")
      message.reply('PONG! :ping_pong:')
    }

    if (message.content === 'roleID()') {
      console.log(message.guild.roles)
      message.reply('Check the console log for the roles and their IDs.')
    }

    if (message.content === 'logout()' && message.member.id === config.get('bot.owner')) {
      message.reply(':wave:')
      client.destroy()
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
