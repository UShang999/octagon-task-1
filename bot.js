const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
const { setIntervalAsync } = require('set-interval-async');

// --- НАСТРОЙКИ ---
const token = '8599667617:AAG3RfnUMkJPS-XJhYAK7_EqaADw0WQy_Oc';
const bot = new TelegramBot(token, { polling: true });

// Подключение к базе данных (XAMPP должен быть запущен)
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ChatBotTests"
});

console.log('Бот запущен и готов к работе...');

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Функция для обновления или добавления пользователя в БД
function updateUserData(msg) {
  const userId = msg.from.id;
  const today = new Date().toISOString().slice(0, 10); // Получаем дату в формате ГГГГ-ММ-ДД

  // SQL запрос: вставляем новую запись или обновляем дату, если ID уже существует
  const sql = "INSERT INTO Users (id, lastMessage) VALUES (?, ?) ON DUPLICATE KEY UPDATE lastMessage = ?";
  
  connection.query(sql, [userId, today, today], (err) => {
    if (err) {
      console.error('Ошибка при обновлении данных пользователя:', err.message);
    }
  });
}

// --- ЛОГИКА ТАЙМЕРА (Ежедневная проверка в 13:00) ---

setIntervalAsync(async () => {
  const now = new Date();
  
  // Проверяем время (13:00 по времени сервера/компьютера)
  if (now.getHours() === 13 && now.getMinutes() === 0) {
    console.log('Запуск проверки активности пользователей...');

    // Ищем пользователей, чье последнее сообщение было более 2 дней назад
    const findInactiveSql = "SELECT id FROM Users WHERE lastMessage < DATE_SUB(CURDATE(), INTERVAL 2 DAY)";
    
    connection.query(findInactiveSql, (err, users) => {
      if (err) return console.error('Ошибка поиска неактивных:', err.message);

      users.forEach(user => {
        // Для каждого такого пользователя берем случайный предмет
        connection.query("SELECT * FROM Items ORDER BY RAND() LIMIT 1", (err, items) => {
          if (!err && items.length > 0) {
            const item = items[0];
            bot.sendMessage(user.id, `Ты давно мне не писал! Давай вспомним, что у нас есть:\n(${item.id}) - ${item.name}: ${item.desc}`);
          }
        });
      });
    });
  }
}, 60000); // Проверка каждую минуту

// --- ОБРАБОТКА ВСЕХ СООБЩЕНИЙ ---
bot.on('message', (msg) => {
  // Обновляем дату активности при любом сообщении (текст, фото, команда)
  if (msg.from) {
    updateUserData(msg);
  }
});

// --- КОМАНДЫ ---

// Команда /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет, Октагон! Я теперь запоминаю дату твоего последнего сообщения.');
});

// Команда /help
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

// --- РАБОТА С БАЗОЙ ДАННЫХ (Items) ---

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

bot.onText(/\/randomItem/, (msg) => {
  connection.query("SELECT * FROM Items ORDER BY RAND() LIMIT 1", (err, results) => {
    if (err || results.length === 0) return bot.sendMessage(msg.chat.id, "В базе данных пусто.");
    const item = results[0];
    bot.sendMessage(msg.chat.id, `(${item.id}) - ${item.name}: ${item.desc}`);
  });
});

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

// --- ИНСТРУМЕНТЫ (QR и Скриншоты) ---

bot.onText(/\!qr (.+)/, (msg, match) => {
  const data = match[1].trim();
  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(data)}`;
  bot.sendPhoto(msg.chat.id, qrUrl, { caption: `✅ QR-код для: ${data}` }).catch(() => {
    bot.sendMessage(msg.chat.id, 'Не удалось сгенерировать QR-код.');
  });
});

bot.onText(/\!webscr (.+)/, (msg, match) => {
  const url = match[1].trim();
  const formattedUrl = url.startsWith('http') ? url : `http://${url}`;
  const screenUrl = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${formattedUrl}`;

  bot.sendMessage(msg.chat.id, '📸 Делаю скриншот сайта...');
  bot.sendPhoto(msg.chat.id, screenUrl, { caption: `Скриншот сайта: ${formattedUrl}` }).catch((error) => {
    bot.sendMessage(msg.chat.id, '❌ Ошибка скриншота.');
  });
});