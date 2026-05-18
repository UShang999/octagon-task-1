const TelegramBot = require('node-telegram-bot-api');

// Токен на бота
const token = '8599667617:AAFhKdoFQxr2-xKP09BSgtD_3VQYJldsVqY';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Слушаем команду /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет, октагон!');
});

console.log('Бот запущен...');