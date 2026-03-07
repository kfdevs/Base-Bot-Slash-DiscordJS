
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'deletes a specific number of messages',
  options: [
    {
      name: 'quantidade',
      description: 'number of messages to delete (1-100)',
      type: 4,
      required: true,
      min_value: 1,
      max_value: 100
    }
  ],
  
  async run(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ | Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const quantidade = interaction.options.getInteger('quantidade');
    const channel = interaction.channel;

    try {
      // Responde à interação primeiro
      await interaction.reply({
        content: `🗑️ | Deletando ${quantidade} mensagem(ns)...`,
        ephemeral: true
      });

      const messages = await channel.messages.fetch({ limit: quantidade });
      
      // Filtra mensagens que não são muito antigas (Discord não permite deletar mensagens com mais de 14 dias)
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const messagesToDelete = messages.filter(msg => msg.createdTimestamp > twoWeeksAgo);

      if (messagesToDelete.size === 0) {
        return interaction.editReply({
          content: '❌ | Não há mensagens para deletar ou todas as mensagens são muito antigas (mais de 14 dias).'
        });
      }

      const deletedMessages = await channel.bulkDelete(messagesToDelete, true);
      
      await interaction.editReply({
        content: `✅ | **${deletedMessages.size}** mensagem(ns) deletada(s) com sucesso!`
      });

      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error('Erro ao deletar reply:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Erro ao deletar mensagens:', error);
      
      try {
        await interaction.editReply({
          content: '❌ | Ocorreu um erro ao deletar as mensagens.'
        });
      } catch (editError) {
        console.error('Erro ao editar reply:', editError);
      }
    }
  }
};
