
const path = require('path');
const fs = require('fs');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
  const commandsFolder = path.join(__dirname, "../commands");
  const commands = [];
  
  const loadCommands = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        loadCommands(filePath);
      } else if (file.endsWith('.js')) {
        try {
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);
          
          if (command.name && typeof command.run === 'function') {
            client.slashCommands.set(command.name, command);
            
            // Prepare command data for Discord API registration
            const commandData = {
              name: command.name,
              description: command.description || 'Sem descrição'
            };
            
            if (command.options) {
              commandData.options = command.options;
            }
            
            commands.push(commandData);
          }
        } catch (error) {
          console.error(`Erro ao carregar comando ${file}:`, error);
        }
      }
    }
  };
  
  loadCommands(commandsFolder);
  
  // Handle slash command interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const command = client.slashCommands.get(interaction.commandName);
    
    if (!command) {
      return interaction.reply({
        content: '❌ | Comando não encontrado.',
        ephemeral: true
      });
    }
    
    try {
      await command.run(client, interaction);
    } catch (error) {
      console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
      
      const errorMessage = {
        content: '❌ | Ocorreu um erro ao executar este comando.',
        ephemeral: true
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  });

  // Register commands with Discord when client is ready
  client.once('ready', async () => {
    try {
      const { token } = require('../token.json');
      const rest = new REST({ version: '10' }).setToken(token);
      
      console.log(`🔄 Registrando ${commands.length} slash command(s)...`);
      
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      
      console.log(`✅ ${commands.length} slash command(s) registrados com sucesso!`);
      console.log(`👀 @K.F Group - ${client.user.username} Está on-line.`)
      
    } catch (error) {
      console.error('❌ Erro ao registrar slash commands:', error);
    }
  });
};
