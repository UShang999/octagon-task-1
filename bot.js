const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');

const token = '8599667617:AAG3RfnUMkJPS-XJhYAK7_EqaADw0WQy_Oc';
const bot = new TelegramBot(token, { polling: true });

// Настройка подключения к БД
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ChatBotTests"
});

// 1. Команда /randomItem - случайный предмет
bot.onText(/\/randomItem/, (msg) => {
  const chatId = msg.chat.id;
  // SQL запрос ORDER BY RAND() выберет одну случайную строку
  connection.query("SELECT * FROM Items ORDER BY RAND() LIMIT 1", (err, results) => {
    if (err || results.length === 0) return bot.sendMessage(chatId, "В базе данных пусто.");
    
    const item = results[0];
    bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
  });
});

// 2. Команда /deleteItem {id} - удаление по ID
bot.onText(/\/deleteItem (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1]; // Получаем ID из текста после команды

  connection.query("DELETE FROM Items WHERE id = ?", [id], (err, result) => {
    if (err) return bot.sendMessage(chatId, "Ошибка при удалении.");
    
    if (result.affectedRows > 0) {
      bot.sendMessage(chatId, "Удачно");
    } else {
      bot.sendMessage(chatId, "Ошибка (такого предмета нет)");
    }
  });
});

// 3. Команда /getItemByID {id} - поиск по ID
bot.onText(/\/getItemByID (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];

  connection.query("SELECT * FROM Items WHERE id = ?", [id], (err, results) => {
    if (err) return bot.sendMessage(chatId, "Ошибка при поиске.");
    
    if (results.length > 0) {
      const item = results[0];
      bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
    } else {
      bot.sendMessage(chatId, "Предмет не найден.");
    }
  });
});

console.log('Бот со связкой БД запущен...');