const TelegramBot = require('node-telegram-bot-api');
const pool = require('../config/db');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log('🤖 Bot Telegram berjalan (polling)');

bot.on('polling_error', (err) => console.error('❌ [polling_error]', err));
bot.on('message', (msg) => {
  const message_id = msg.message_id;
  const id = msg.from?.id;
  const username = msg.from?.username || 'unknown';
  const text = msg.text || '';

  console.log('► Pesan masuk:');
  console.log('  message id :', message_id);
  console.log('  user id    :', id);
  console.log('  user       :', username);
  console.log('  text       :', text);
});

bot.onText(/\/start(?:\s+(.+))?/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId, 'Selamat datang di sistem notifikasi RSUD Tengku Rafi`an');

  const linkRows = await pool.query(
    'SELECT * FROM user_telegram WHERE telegram_id = ?',
    [chatId]
  );

  const usernameId = linkRows[0]?.[0]?.user_id || null;

  if (usernameId != null ) {
    await bot.sendMessage(chatId, 'Akun anda sudah terdaftar di bot ini');

  } else {
    await bot.sendMessage(chatId, 
      'Akun anda belum terdaftar di bot ini, silahkan ketik <code>/register link:(username anda di website)</code> untuk mendaftar ke bot ini', 
      { parse_mode: 'HTML' }
    );
    await bot.sendMessage(chatId, 
      'Contoh : <code>/register link:itsmeahsan</code>',
      { parse_mode: 'HTML'}
    );
  }

})

bot.onText(/\/register(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1];

  if (param && param.startsWith('link:')) {
    const username = param.split(':')[1];
    const user = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const users = user[0]?.[0]?.username || null;

    if (users == null) {
      await bot.sendMessage(chatId, '❌ Tidak ada username yang terdaftar di website dengan username tersebut!');
    } else {
        try {
        const now = new Date();
        const sql = `
          INSERT INTO user_telegram (user_id, telegram_id, linked_at)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            telegram_id = VALUES(telegram_id),
            linked_at = VALUES(linked_at)
        `;
        await pool.query(sql, [username, chatId.toString(), now]);

        await bot.sendMessage(chatId, '✅ Akun Telegram Anda berhasil terhubung dengan username di website.');
      } catch (err) {
        console.error('❌ Error menyimpan mapping ke DB:', err);
        await bot.sendMessage(chatId, '❌ Gagal menghubungkan akun. Silakan coba lagi nanti.');
      }
    }
  } else {
    await bot.sendMessage(chatId, '❌ Perintah yang anda masukkan tidak sesuai!');
  }
});


bot.on('message', async (msg) => {
  const text = msg.text || '';
  const chatId = msg.chat.id;

  if (text.startsWith('/')) {
    const handledCommands = ['/start', '/register'];

    const command = text.split(' ')[0];

    if (!handledCommands.includes(command)) {
      await bot.sendMessage(chatId, '❌ Perintah tersebut tidak tersedia di bot ini! Gunakan perintah /start atau /register');
    }
  }
});


module.exports = bot;
