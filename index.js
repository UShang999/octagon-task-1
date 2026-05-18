const express = require('express');
const app = express();
const PORT = 3000;

// Это обработчик для главной страницы
app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// А эта часть заставляет сервер работать постоянно и не выключаться
app.listen(PORT, () => {
    console.log(`Сервер запущен и готов к работе на http://localhost:${PORT}`);
});