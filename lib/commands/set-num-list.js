const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    name: "Set Number List",
    description: "You can set a list of numbers for the bot to use",
    usage: "<num1>,<num2>,<num3>,etc",
    data: new SlashCommandBuilder()
        .setName('set-num-list')
        .setDescription('You can set a list of numbers for the bot to use')
        .addStringOption(option => option
            .setName('num-list')
            .setDescription('The list of numbers')
            .setRequired(true)),
    async execute({ interaction }) {
        console.log(interaction.createdAt, interaction.createdTimestamp, Date.now())
        let newNumList = await interaction.options.getString('num-list').split(',');
        fs.writeFileSync('./lib/misc/num_list.json', JSON.stringify(newNumList, null, 2));
        return await interaction.reply(`Replaced all the numbers with these:\n${newNumList.join('\n')}`)
    },
};