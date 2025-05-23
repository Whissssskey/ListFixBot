// Загружаем переменные окружения из .env файла 
// Load environment variables from .env file
require('dotenv').config();
// Импортируем необходимые классы из Telegraf 
// Import required classes from Telegraf
const { Telegraf, Markup } = require('telegraf');

// Создаем экземпляр бота с токеном 
// Create bot instance with token
const bot = new Telegraf(process.env.BOT_TOKEN);
// Объект для хранения предпочтений пользователей 
// Object to store user preferences
const userPreferences = {};

// Обработчик команды /start 
//start command handler
bot.start((ctx) => {
  ctx.reply(
    // Приветственное сообщение
    // Welcome message
    'Привет! Присылай мне список, и я его отформатирую.\nВыбери режим:',
    // Создаем inline-клавиатуру
    // Create inline keyboard
    Markup.inlineKeyboard([
      // Кнопка для режима capitalize 
      // Button for capitalize mode
      [Markup.button.callback('С заглавной буквы', 'capitalize')],
      // Кнопка для режима asis
      // Button for asis mode
      [Markup.button.callback('Как есть', 'asis')],
      // Кнопка для режима lowercase
      // Button for lowercase mode
      [Markup.button.callback('Со строчной буквы', 'lowercase')]
    ])
  );
});

// Обработчик выбора режима
// Mode selection handler
bot.action(['capitalize', 'asis', 'lowercase'], (ctx) => {
  // Получаем ID пользователя
  // Get user ID
  const userId = ctx.from.id;
  // Сохраняем выбранный режим
  // Save selected mode
  userPreferences[userId] = ctx.callbackQuery.data;
  let modeName;
  // Определяем название режима для ответа
  // Determine mode name for response
  switch (ctx.callbackQuery.data) {
    case 'capitalize': modeName = 'С заглавной'; break;
    case 'lowercase': modeName = 'Со строчной'; break;
    default: modeName = 'Как есть';
  }
  // Отправляем информацию о выборынном режиме
  // Send information about selected mode
  ctx.answerCbQuery(`Выбран режим: ${modeName}`);
});

// Обработчик текстовых сообщений
// Text messages handler
bot.on('text', (ctx) => {
  // Получаем ID пользователя 
  // Get user ID
  const userId = ctx.from.id;
  // Получаем текст сообщения
  // Get message text
  const text = ctx.message.text;
  // Получаем сохраненный режим
  // Get saved mode
  const mode = userPreferences[userId];

  // Проверяем, выбран ли режим
  // Check if mode is selected
  if (!mode) {
    // Просим выбрать режим 
    // Ask to select mode
    return ctx.reply('Пожалуйста, сначала выберите режим через /start');
  }

  // Форматируем список 
  // Format the list
  const formattedList = formatList(text, mode);
  // Отправляем отформатированный список
  // Send formatted list
  ctx.reply(formattedList);
});

// Функция форматирования списка
// List formatting function
function formatList(text, mode) {
  return text
    // Разбиваем текст на строки
    // Split text into lines
    .split('\n')
    .map(line => {
      // Ищем строки, начинающиеся с цифр (игнорируя пробелы)
      // Find lines starting with numbers (ignoring spaces)
      const match = line.match(/^\s*(\d+)\.?\s*(.*)/);
      // Пропускаем строки без номеров
      // Skip lines without numbers
      if (!match || !match[2]) return line;

      // Получаем номер
      // Get the number
      const number = match[1];
      // Получаем содержимое и убираем лишние пробелы
      // Get the content and trim spaces
      let content = match[2].trim();

      // Применяем выбранный режим регистра
      // Apply selected case mode
      if (mode === 'capitalize') {
        // Первая буква заглавная, остальные строчные
        // First letter uppercase, rest lowercase
        content = content.charAt(0).toUpperCase() + content.slice(1).toLowerCase();
      } else if (mode === 'lowercase') {
        // Все буквы строчные
        // All letters lowercase
        content = content.toLowerCase(); // Применяем ко всем строкам
      }

      // Режим 'asis' - оставляем как есть
      // 'asis' mode - leave as is
      
      // Возвращаем отформатированную строку
      // Return formatted line
      return `${number}. ${content}`;
    })
    // Собираем строки обратно в текст
    // Join lines back into text
    .join('\n');
}

// Запускаем бота
// Launch the bot
bot.launch();