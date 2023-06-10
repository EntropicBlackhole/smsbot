const Discord = require('discord.js');
const config = require('./config.json');
const path = require('node:path');
const fs = require('fs')
var telnyx = require('telnyx')(config.telnyx_token);
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.DirectMessages
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message
    ]
});
const commands = [];
const commandsPath = path.join(__dirname, './lib/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Discord.Collection();
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}
const rest = new Discord.REST({ version: '10' }).setToken(config.discord_token);
rest.put(Discord.Routes.applicationCommands('1116860358209056799'), { body: commands })
    .then(data => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);

client.login(config.discord_token)

client.once('ready', async (c) => {
    console.log(`Logged in as ${c.user.tag}!`);
})

client.on('messageCreate', async (message) => {
    if (message.channel.id == '1105365656687349815') {
        if (!message.content.startsWith('<sms://888222/;?&body=')) return;
        let numList = JSON.parse(fs.readFileSync('./lib/misc/num_list.json'));
        for (num of numList) {
            console.log("\"" + num + "\"")
            try {
                await telnyx.messages.create({
                    from: num,
                    to: "888222",
                    text: message.content.split('=')[1].split('>')[0]
                });
            }
            catch (e) {
                client.users.send('147033367559274496', `Error sending ${message.content.split('=')[1].split('>')[0]} from \`${num}\`, number may be invalid`);
            }
            console.log(`Sent "${message.content.split('=')[1].split('>')[0]}" from ${num}`);
        }
    } else if (message.channel.id == '1116891974591598743') {
        if (message.author.id != '147033367559274496') return;
        let numList = JSON.parse(fs.readFileSync('./lib/misc/num_list.json'));
        for (num of numList) {
            console.log("\"" + num + "\"")
            try {
                await telnyx.messages.create({
                    from: num,
                    to: "888222",
                    text: message.content
                });
            }
            catch (e) {
                client.users.send('147033367559274496', `Error sending ${message.content} from \`${num}\`, number may be invalid`);
            }
            console.log(`Sent "${message.content}" from ${num}`);
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    await sleep(1500)
    console.log(interaction.createdAt, interaction.createdTimestamp, Date.now())
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    // console.log(command)
    try {
        await command.execute({ interaction });
    } catch (error) {
        console.error(error);
    }
});
async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}