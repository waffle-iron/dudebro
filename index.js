// run count: 

console.log('\n\n==== dudebro v0.0.1 build 6 ====\n\n');

// bot constructor
var Discord = require('discord.io');
var client = new Discord.Client({
    autorun: true,
    token: "Mjc4Njc1ODk1OTE5ODM3MTg1.C30wqg.pQF6IOX5VqNsLNY6zqcCRdJV8Lg"
});

var standbyList = ['singleEntryForAReason'];

// defining fueldudes variables
var fuelClientID = null;
var fuelClientName = null;
var fuelClientSystem = null;
var fuelClientRealm = null;
var fuelClientO2 = null;
var fuelClientSection = null;
var fuelClientState = null; // for reference: 1 == info collection, 2 == fueldude dispatch mode, 3 == debrief, null == reset


// ================ CUSTOM FUNCTIONS ================ //

function changeNick(nickname) {
    client.editNickname({
        nick: nickname,
        serverID: "272508231597817856",
        userID: "278675895919837185"
    });
    console.log('Nickname automatically changed to ' + nickname + '');
}

function reply(channelID, userID, message) {
    client.sendMessage({
        to: channelID,
        message: '<@!' + userID + '> ' + message
    });
    console.log('----------------\n\n' + message);
}

function dudeTalkBack(channelID, userID, message) {
    client.sendMessage({
        to: channelID,
        message: '<@!' + userID + '> ' + message
    });
    console.log(message);
}

function busy(isBusy) {
    if (isBusy === true) {
        idleTime = Date.now();
    } else {
        idleTime = null;
    }

    client.setPresence({
        idle_since: idleTime
    });
}

function reset() {
    fuelClientID = null;
    fuelClientName = null;
    fuelClientSystem = null;
    fuelClientRealm = null;
    fuelClientO2 = null;
    fuelClientSection = null;
    fuelClientState = null;
}

function dispatchTransition() {

}

function dudeLogin(userID) {
    for (var i = 0; i < standbyList.length; i++) {
        console.log(standbyList[i]);
        if (standbyList[i] === userID) return "You\'re already on duty!";
    }
    standbyList.push(userID);
    return ("You are now set as **on-duty**.");
}

function dudeLogout(userID) {
    for (var i = 0; i < standbyList.length; i++) {
        if (standbyList[i] === userID) {
            standbyList.splice(i, i + 1);
            return ("You are now set as **off-duty**.");
        }
    }
    return ("You\'re already off duty!");
}

// ================ BOT HANDLING ================ //

// lets us know when the bot is online
client.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', client.username, client.id);
    changeNick('Dispatch');
});

// warn us when the bot is either disconnected or fails to connect
client.on('disconnect', function(errMsg, code) {
    if (code === 0) {
        console.log('Failed to connect to Discord.\nCheck your Internet connection and bot token, and then try again.\n' + code + ': ' + errMsg);
    } else {
        console.log('Failed to connect to Discord.\n' + code + ': ' + errMsg);
    }
});


// ================ DISPATCH AND DEBUG COMMANDS ================ //

client.on('message', function(user, userID, channelID, message, event) {
    // dispatch program

    // initial prompt to get the user started.
    if (channelID === '277698627793584128') {

        // ---------------- INFO COLLECTION ---------------- //
        if (message === 'help' && fuelClientState === null) { // null check so that this message won't display more than once per session
            fuelClientState = 1;
            fuelClientID = userID;
            statement = '**Hey there, ' + user + '!** Let\'s get you out of trouble.\n\nFor starters, would you please tell me your commander name?\n*You\'ll need to include "CMDR" in your name, otherwise I won\'t detect your name!*\n\nIf at any point in time you would like to cancel dispatch, send `cancel`.';
            reply(channelID, userID, statement);
            busy(true);
        }

        if (userID === fuelClientID && fuelClientState === 1) {
            // name updater and system prompt
            if (message.startsWith("CMDR ")) {
                if (fuelClientName === null) {
                    statement = '**' + message + '** it is! If that doesn\'t look right, please send your name again.\n\nNext, I need to know which system you\'re in. Make sure to include "system" at the end so I can detect it.\nExample: `Eravate system`';
                } else {
                    statement = 'Name updated to **' + message + '**.';
                }
                fuelClientName = message;
                reply(channelID, userID, statement);
                busy(true);
            }

            // system updater and platform prompt
            if (message.endsWith(" system") && userID === fuelClientID) {
                endSlice = message.lastIndexOf(" system");
                message = message.slice(0, endSlice);
                if (fuelClientSystem === null) {
                    statement = 'I have noted your system as **' + message + '**! If that doesn\'t look right, please send it again.\n\nNext, I need to know which platform you\'re playing on. Respond with either `pc`, `ps4` or `xbox` to let me know!';
                } else {
                    statement = 'System updated to **' + message + '**.';
                }
                fuelClientSystem = message;
                reply(channelID, userID, statement);
                busy(true);
            }

            // platform updater and O2 prompt
            if (message === 'xbox' || message === 'ps4' || message === 'pc') {
                message = message.toUpperCase();
                if (fuelClientRealm === null) {
                    statement = 'Alright, we\'ll make sure to send a fuel dude on the **' + message + '** platform.\n\nLastly, are you running on life support (blue countdown in the upper right)? Please respond with `yes` or `no`.';
                } else {
                    statement = 'I have noted your platform change to **' + message + '**.';
                }
                fuelClientRealm = message;
                reply(channelID, userID, statement);
                busy(true);
            }

            // O2 updater
            if (message === 'yes' || message === 'no') {
                if (message === 'yes') {
                    fuelClientO2 = true;
                } else {
                    fuelClientO2 = false;
                };
                statement = 'Roger that. I am dispatching the fuel dudes now.';
                reply(channelID, userID, statement);
                dispatchTransition();
                busy(true);
            }

            if (message === 'cancel') {
                busy(false);
                reset();
                statement = 'Okay, I\'ve cancelled fuel dispatch. Have a great day!';
                reply(channelID, userID, statement);
            }
        }

        // ---------------- DISPATCH PROGRAM ---------------- //

        if (fuelClientState === 2) {
            if (true) { // placeholder for role check

                // jump communication
                if (message.endsWith('j')) {
                    reply('roger.');
                }
                // =+ lexicon += //
                // beacon (bc+/bc-)

                // code red (case red/code red/cr)

                // debrief (debrief/db)

                // disconnected (dc)

                // client in the exclusion zone (ez)

                // friend requesting (fr+/fr-)

                // omw

                // Returning to base (rtb)

                // Roger (rgr)

                // standby (dude signing on for duty)

                // offline (dude signing off of duty)

                // arrived in system (sys+/0j)

                // wing request (wr+/wr-)

                // =+ commands += //
                // 


            }
        }

        if (true) { // placeholder for fueldude role check
            if (message === "standby") {
                reply(channelID, userID, dudeLogin(userID));
            }

            if (message === ("offline")) {
                reply(channelID, userID, dudeLogout(userID));
            }
        }
    }


    // debugging commands, which will work on any channel

    if (message === "ping") {
        reply(channelID, userID, 'pong!');
    }

    if (message.endsWith(" slice test")) {
        endSlice = message.lastIndexOf(" slice test");
        statement = message.slice(0, endSlice);
        reply(channelID, userID, statement);
    }

    if (message === "sudo shutdown -h now") {
        changeNick("Offline");
        client.disconnect();
    }

    if (message === 'dispatch status test') {
        busy(true);
    }

    if (message === 'dispatch ended test') {
        busy(false);
    }
});