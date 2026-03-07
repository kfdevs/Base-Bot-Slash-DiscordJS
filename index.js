const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  partials: Object.keys(Partials),
});

module.exports = client;
client.slashCommands = new Collection();

const { token } = require("./token.json");

client.login(token);

const evento = require("./handler/events");
evento.run(client);
require("./handler/index")(client);