const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const token = process.env.TOKEN;
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const command = new SlashCommandBuilder()
  .setName('drop')
  .setDescription('Spróbuj szczęścia! 5% szans na wygraną.');

// Kolekcja do przechowywania cooldownów
const cooldowns = new Map();
const cooldownTime = 2 * 60 * 60 * 1000; // 2 godziny

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
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const userId = interaction.user.id;

  // Sprawdzanie cooldownu
  if (cooldowns.has(userId)) {
    const now = Date.now();
    const expirationTime = cooldowns.get(userId) + cooldownTime;

    if (now < expirationTime) {
      const remaining = expirationTime - now;
      const remainingHours = Math.floor(remaining / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remaining % (1000 * 60)) / 1000);

      return interaction.reply({
        content: `Spróbuj ponownie za ${remainingHours} godzin, ${remainingMinutes} minut i ${remainingSeconds} sekund.`,
        ephemeral: true, // Wysyłamy wiadomość tylko do użytkownika
      });
    }
  }

  // Komenda działa, więc ustawiamy cooldown
  cooldowns.set(userId, Date.now());

  // Kod do wykonania komendy
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

client.login(token);
