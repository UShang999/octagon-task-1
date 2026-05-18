const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('<h1>Привет, Октагон!</h1>');
});

// 1. Статический роут (просто возвращает JSON)
app.get('/static', (req, res) => {
    res.json({
        header: "Hello",
        body: "Octagon NodeJS Test"
    });
});

// 2. Динамический роут с расчетами
app.get('/dynamic', (req, res) => {
    // Получаем переменные из req.query
    const { a, b, c } = req.query;

    // Превращаем их в числа
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const numC = parseFloat(c);

    // Проверяем: все ли переменные есть и являются ли они числами
    if (isNaN(numA) || isNaN(numB) || isNaN(numC)) {
        return res.json({ header: "Error" });
    }

    // Считаем по формуле: (a * b * c) / 3
    const result = (numA * numB * numC) / 3;

    res.json({
        header: "Calculated",
        body: String(result) // Возвращаем как строку, чтобы соответствовать формату
    });
});

app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
});