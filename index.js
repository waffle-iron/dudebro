var Config = require('config-js');
devConf = true;

if (devConf) {
    var config = new Config('./config_dev.js');
} else {
    var config = new Config('./config.js');
}

console.log("======== dudebro v0.1.0 build 71 ========");

// import the discord.js module
const Discord = require('discord.js');

// create an instance of a Discord Client, and call it client
const client = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.get('bot.token');

// defining fueldudes variables
var standbyList = []; // array that keeps track of pilots on duty. the bot uses
//                       this array to contact available pilots that the bot can
//                       directly request assistance from

var fuelClientID = null; // id for the client reveiving assistance
var fuelClientName = null; // CMDR name of the client
var fuelClientSystem = null; // client's current system
var fuelClientRealm = null; // client's platform (i.e. xbox)
var fuelClientLifeSupport = null; // boolean determining whether the client is
//                                   using life support oxygen
var fuelClientSection = null; // unused variable
var fuelClientState = null; // for reference: 1 == info collection, 2 == fueldude dispatch mode, 3 == debrief, null == reset

// the ready event is vital, it means that your bot will only start reacting to
// information from Discord _after_ ready is emitted.
client.on('ready', () => {
    console.log('Connection to Discord established.');
    client.user.setGame("available");
    console.log('Status set to "available".');
    client.user.setPresence({
        status: "online",
    });
    console.log('Presence set.');
});

// ================ Custom Functions ================ //

function reply(message, text) {
    try {
        message.channel.sendMessage('**<@!' + message.member.id + '>:** ' + text);
    } catch (error) {
        message.channel.sendMessage("Whoops! That didn't work. Here's the error shenanigans:\n\n" + error + "\n\nCC <@!" + message.member.id + ">");
    }
}

// =============== Bot Event Listener =============== //

// create an event listener for messages
client.on('message', message => {
    console.log(message.member.displayName + ": " + message.content);

    try {
        // if the message is "ping",
        if (message.content === 'ping') {
            // send "pong" to the same channel.
            reply(message, "pong! :ping_pong:");
        }

        if (message.content === "roleID()") {
            console.log(message.guild.roles);
            reply(message, "Check the console log for the roles and their IDs.");
        }

        if (message.content === "/register") {
            let fuelDudes = message.guild.roles.find("name", "Fuel Dudes");
            message.member.addRole(fuelDudes);
            reply(message, "You are now registered as a **Fuel Dude**! Fly safe, commander. o7");
        }

        if (message.content === "/unregister") {
            let fuelDudes = message.guild.roles.find("name", "Fuel Dudes");
            message.member.removeRole(fuelDudes);
            reply(message, "You are no longer registered as a Fuel Dude. We hope to have your assistance again soon.");
        }

        if (message.content === 'isRegisteredPilot()') {
            registered = message.member.roles.exists("name", "Fuel Dudes");
            if (registered) reply(message, "You are registered as a Fuel Dude pilot! :smile:");
            if (!registered) reply(message, "You are not registered as a Fuel Dude pilot. :frowning2:")
        }

        if (message.content.startsWith === 'getNick(') {
            id = message.content.slice(0, 8);
            last = id.indexOf(")");
            console.log(id);
            id = slice(last - 1, last);
            console.log(id);
            reply(message, "That ID belongs to <@!" + id + ">");
        }

        if (message.content === "logout()") {
            reply(message, ":wave:");
            client.destroy();
        }

        if (message.content === "testGreen()") {
            editRole = message.guild.roles.get("Fuel Dudes");
            console.log(editRole);
        }
    } catch (error) {
        message.channel.sendMessage("Whoops! That didn't work. Here's the error shenanigans:\n\n" + error + "\n\nCC <@!" + message.member.id + ">");
    }
});

// log our bot in
client.login(token);