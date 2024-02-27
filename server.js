// Импорт необходимых модулей и библиотек
import express from "express"; // Импорт библиотеки Express.js для создания сервера
import cors from "cors"; // Импорт библиотеки для обработки CORS
import bodyParser from "body-parser"; // Импорт библиотеки для разбора тела запроса
import * as crypto from "crypto"; // Импорт модуля crypto для генерации уникальных идентификаторов

// Создание экземпляра приложения Express
const app = express();

// Использование middleware для обработки CORS
app.use(cors());

// Использование middleware для разбора JSON-тела запроса
app.use(
  bodyParser.json({
    type(req) {
      return true;
    },
  })
);

// Middleware для установки заголовка Content-Type в application/json для всех ответов
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Инициализация списка заявок (tickets)
let tickets = [
  {
    id: crypto.randomUUID(),
    name: "Поменять краску в принтере, ком. 404",
    description: "Принтер HP LJ-1210, картриджи на складе",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Переустановить Windows, PC-Hall24",
    description: "",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Установить обновление KB-31642dv3875",
    description: "Вышло критическое обновление для Windows",
    status: false,
    created: Date.now(),
  },
];

// Middleware для обработки всех запросов к серверу
app.use(async (request, response) => {
  const { method, id } = request.query; // Извлечение метода запроса и идентификатора из параметров запроса
  switch (method) {
    case "allTickets": // В случае запроса на получение всех заявок
      response.send(JSON.stringify(tickets)).end(); // Отправка списка всех заявок в формате JSON
      break;
    case "ticketById": // В случае запроса на получение заявки по идентификатору
      const ticket = tickets.find((ticket) => ticket.id === id); // Поиск заявки по идентификатору
      if (!ticket) {
        response
          .status(404)
          .send(JSON.stringify({ message: "Ticket not found" })) // Если заявка не найдена, отправка ошибки "Ticket not found"
          .end();
        break;
      }
      response.send(JSON.stringify(ticket)).end(); // Отправка найденной заявки в формате JSON
      break;
    case "createTicket": // В случае запроса на создание новой заявки
      try {
        const createData = request.body; // Извлечение данных о новой заявке из тела запроса
        const newTicket = { // Создание новой заявки
          id: crypto.randomUUID(),
          name: createData.name,
          status: false,
          description: createData.description || "",
          created: Date.now(),
        };
        tickets.push(newTicket); // Добавление новой заявки в список заявок
        response.send(JSON.stringify(newTicket)).end(); // Отправка созданной заявки в формате JSON
      } catch (error) {
        response.status(500).send(JSON.stringify({ error: error.message })); // Если произошла ошибка при создании заявки, отправка ошибки сервера
      }
      break;
    case "deleteById": // В случае запроса на удаление заявки по идентификатору
      const ticketToDelete = tickets.find((ticket) => ticket.id === id); // Поиск заявки по идентификатору
      if (ticketToDelete) {
        tickets = tickets.filter((ticket) => ticket.id !== id); // Удаление заявки из списка заявок
        response.status(204).end(); // Отправка успешного статуса без содержимого (No Content)
      } else {
        response
          .status(404)
          .send(JSON.stringify({ message: "Ticket not found" })) // Если заявка не найдена, отправка ошибки "Ticket not found"
          .end();
      }
      break;
    case "updateById": // В случае запроса на обновление заявки по идентификатору
      const ticketToUpdate = tickets.find((ticket) => ticket.id === id); // Поиск заявки по идентификатору
      const updateData = request.body; // Извлечение данных для обновления из тела запроса
      if (ticketToUpdate) {
        Object.assign(ticketToUpdate, updateData); // Обновление данных заявки
        response.send(JSON.stringify(tickets)); // Отправка списка заявок в формате JSON после обновления
      } else {
        response
          .status(404)
          .send(JSON.stringify({ message: "Ticket not found" })) // Если заявка не найдена, отправка ошибки "Ticket not found"
          .end();
      }
      break;
    default:
      response.status(404).end(); // Если метод запроса не соответствует ни одному известному методу, отправка ошибки "Not Found"
      break;
  }
});

// Определение порта, на котором будет запущен сервер
const port = process.env.PORT || 3000;

// Асинхронная функция для запуска сервера
const bootstrap = async () => {
  try {
    app.listen(port, () =>
        console.log(`Server has been started on http://localhost:${port}`) // Вывод сообщения о запуске сервера и указанием его адреса и порта
    );
  } catch (error) {
    console.error(error); // В случае ошибки при запуске сервера, вывод ошибки в консоль
  }
};

// Вызов функции для запуска сервера
bootstrap();