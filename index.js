const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Настройка подключения к БД
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ChatBotTests"
});

// 1. Получить все элементы (GET)
app.get('/getAllItems', (req, res) => {
  connection.query("SELECT * FROM Items", (err, results) => {
    if (err) return res.json(null);
    res.json(results);
  });
});

// 2. Добавить элемент (POST)
app.post('/addItem', (req, res) => {
  const { name, desc } = req.query;
  if (!name || !desc) return res.json(null);

  connection.query("INSERT INTO Items (name, `desc`) VALUES (?, ?)", [name, desc], (err, result) => {
    if (err) return res.json(null);
    // Возвращаем созданный объект
    res.json({ id: result.insertId, name, desc });
  });
});

// 3. Удалить элемент (POST)
app.post('/deleteItem', (req, res) => {
  const { id } = req.query;
  if (!id) return res.json(null);

  connection.query("DELETE FROM Items WHERE id = ?", [id], (err, result) => {
    if (err) return res.json(null);
    if (result.affectedRows === 0) return res.json({});
    res.json({ message: "Deleted", id });
  });
});

// 4. Обновить элемент (POST)
app.post('/updateItem', (req, res) => {
  const { id, name, desc } = req.query;
  if (!id || !name || !desc) return res.json(null);

  connection.query("UPDATE Items SET name = ?, `desc` = ? WHERE id = ?", [name, desc, id], (err, result) => {
    if (err) return res.json(null);
    if (result.affectedRows === 0) return res.json({});
    res.json({ id, name, desc });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер с БД запущен на http://localhost:${PORT}`);
});