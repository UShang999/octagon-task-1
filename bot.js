const TelegramBot = require('node-telegram-bot-api');

// Твой токен остается тем же
const token = '8599667617:AAG3RfnUMkJPS-XJhYAK7_EqaADw0WQy_Oc';
const bot = new TelegramBot(token, { polling: true });

// Команда /start (оставим для приличия)
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, октагон!');
});

// 1. Команда /help - список команд
bot.onText(/\/help/, (msg) => {
  const helpText = `Список доступных команд:
/site - Ссылка на сайт Октагона
/creator - Информация об авторе бота`;
  bot.sendMessage(msg.chat.id, helpText);
});

// 2. Команда /site - ссылка на сайт
bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Сайт Октагона: https://octagon-edu.ru'); 
});

// 3. Команда /creator - твое ФИО
bot.onText(/\/creator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Автор бота: Гицел Полина'); 
});

console.log('Бот обновлен и запущен...');