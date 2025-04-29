const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, InteractionType } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const command = new SlashCommandBuilder()
  .setName('drop')
  .setDescription('Spróbuj szczęścia! 5% szans na wygraną.');

// Rejestracja komendy
client.once('ready', async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

  const CLIENT_ID = client.user.id;
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [command.toJSON()] }
    );
    console.log('✅ Slash command /drop zarejestrowana.');
  } catch (error) {
    console.error('❌ Błąd rejestracji komendy:', error);
  }
});

// Obsługa komendy
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'drop') {
    const chance = Math.floor(Math.random() * 100) + 1;
    let embed;

    if (chance <= 5) {
      embed = new EmbedBuilder()
        .setTitle('**__WYGRANA__**')
        .setDescription('**Gratulacje!** __Wygrałeś rangę Premium na Miesiąc!__ po odbiór zgłoś się na ticketa! Zielona strzała! :tada:')
        .setColor(0x00FF00);
    } else {
      embed = new EmbedBuilder()
        .setTitle('**__PRZEGRANA__**')
        .setDescription('**Niestety...** __Przegrałeś.__ Spróbuj ponownie za 2h :x:')
        .setColor(0xFF0000);
    }

    await interaction.reply({ embeds: [embed] });
  }
});

const token = process.env.TOKEN;
