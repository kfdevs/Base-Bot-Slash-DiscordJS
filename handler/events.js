const fs = require("fs");
const path = require("path");

module.exports = {
  run: async (client) => {
    const eventsPath = path.join(__dirname, "../events");

    const loadEvents = (dir) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          loadEvents(fullPath);
        } else if (file.endsWith(".js")) {
          try {
            delete require.cache[require.resolve(fullPath)];
            const event = require(fullPath);

            if (!event || typeof event.run !== "function" || !event.name) {
              console.warn(`Evento ignorado: ${file} está mal formatado.`);
              continue;
            }

            client.on(event.name, (...args) => event.run(...args, client));
          } catch (error) {
            console.error(`❌ Erro ao carregar o evento ${file}:`, error);
          }
        }
      }
    };

    if (fs.existsSync(eventsPath)) {
      loadEvents(eventsPath);
    } else {
      console.warn("⚠️ Pasta de eventos não encontrada.");
    }
  },
};