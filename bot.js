const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');

// --- НАСТРОЙКИ ---
const token = '8599667617:AAG3RfnUMkJPS-XJhYAK7_EqaADw0WQy_Oc';
const bot = new TelegramBot(token, { polling: true });

// Подключение к базе данных (убедись, что XAMPP запущен)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ChatBotTests"
});

console.log('Бот запущен и готов к работе...');

// --- ОБЫЧНЫЕ КОМАНДЫ (из первых заданий) ---

// Команда /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, Октагон! Я готов выполнять команды.');
});

// Команда /help - список команд
bot.onText(/\/help/, (msg) => {
  const helpText = `Доступные команды:
/site - Ссылка на сайт Октагона
/creator - Автор бота
/items - Список всех товаров из БД
/randomItem - Случайный товар из БД
/getItemByID {id} - Поиск по ID
/deleteItem {id} - Удаление по ID
!qr {текст} - Создать QR-код
!webscr {ссылка} - Скриншот сайта`;
  bot.sendMessage(msg.chat.id, helpText);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Сайт Октагона: https://octagon-edu.ru'); 
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Автор бота: Гицель Полина'); 
});


// --- РАБОТА С БАЗОЙ ДАННЫХ ---

// Показать все предметы
bot.onText(/\/items/, (msg) => {
  connection.query("SELECT * FROM Items", (err, results) => {
    if (err) return bot.sendMessage(msg.chat.id, 'Ошибка БД.');
    if (results.length === 0) return bot.sendMessage(msg.chat.id, 'В базе пусто.');

    let res = 'Список товаров:\n';
    results.forEach(item => {
      res += `(${item.id}) - ${item.name}: ${item.desc}\n`;
    });
    bot.sendMessage(msg.chat.id, res);
  });
});

// Случайный предмет
bot.onText(/\/randomItem/, (msg) => {
  connection.query("SELECT * FROM Items ORDER BY RAND() LIMIT 1", (err, results) => {
    if (err || results.length === 0) return bot.sendMessage(msg.chat.id, "В базе данных пусто.");
    const item = results[0];
    bot.sendMessage(msg.chat.id, `(${item.id}) - ${item.name}: ${item.desc}`);
  });
});

// Поиск по ID
bot.onText(/\/getItemByID (.+)/, (msg, match) => {
  const id = match[1];
  connection.query("SELECT * FROM Items WHERE id = ?", [id], (err, results) => {
    if (err) return bot.sendMessage(msg.chat.id, "Ошибка поиска.");
    if (results.length > 0) {
      const item = results[0];
      bot.sendMessage(msg.chat.id, `(${item.id}) - ${item.name}: ${item.desc}`);
    } else {
      bot.sendMessage(msg.chat.id, "Предмет не найден.");
    }
  });
});

// Удаление по ID
bot.onText(/\/deleteItem (.+)/, (msg, match) => {
  const id = match[1];
  connection.query("DELETE FROM Items WHERE id = ?", [id], (err, result) => {
    if (err) return bot.sendMessage(msg.chat.id, "Ошибка удаления.");
    if (result.affectedRows > 0) {
      bot.sendMessage(msg.chat.id, "Удачно");
    } else {
      bot.sendMessage(msg.chat.id, "Ошибка (такого предмета нет)");
    }
  });
});


// --- НОВЫЕ ИНСТРУМЕНТЫ (QR и Скриншоты) ---

// Команда !qr
bot.onText(/\!qr (.+)/, (msg, match) => {
  const data = match[1].trim();
  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(data)}`;
  
  bot.sendPhoto(msg.chat.id, qrUrl, { caption: `✅ QR-код для: ${data}` }).catch((err) => {
    bot.sendMessage(msg.chat.id, 'Не удалось сгенерировать QR-код.');
  });
});

// Команда !webscr
bot.onText(/\!webscr (.+)/, (msg, match) => {
  const url = match[1].trim();
  
  // Добавляем http:// если пользователь его забыл, иначе сервис может не сработать
  const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
  
  // Используем надежный бесплатный сервис s-shot.ru
  const screenUrl = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${formattedUrl}`;

  bot.sendMessage(msg.chat.id, '📸 Делаю скриншот сайта, подождите...');

  bot.sendPhoto(msg.chat.id, screenUrl, { caption: `Скриншот сайта: ${formattedUrl}` })
    .catch((error) => {
      bot.sendMessage(msg.chat.id, '❌ Ошибка: не удалось получить скриншот. Проверьте правильность ссылки.');
      console.error('Ошибка скриншота:', error.message);
    });
});