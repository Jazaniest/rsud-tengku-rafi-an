const TelegramBot = require('node-telegram-bot-api');
const pool = require('../config/db');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '<ISI_TOKEN_ANDA>';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log('🤖 Bot Telegram dijalankan (polling)');

bot.on('polling_error', (err) => console.error('❌ [polling_error]', err));
bot.on('message', (msg) => console.log('► Pesan masuk:', JSON.stringify(msg, null, 2)));

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1];

  // Balasan awal
  await bot.sendMessage(chatId, '🤖 Bot menerima perintah /start.');

  if (param && param.startsWith('link:')) {
    const username = param.split(':')[1]; // misal "johndoe"
    console.log(`>> Mapping Telegram untuk username=${username}, chatId=${chatId}`);

    try {
      const now = new Date();
      const sql = `
        INSERT INTO user_telegram_link (user_id_web, telegram_chat_id, linked_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          telegram_chat_id = VALUES(telegram_chat_id),
          linked_at = VALUES(linked_at)
      `;
      await pool.query(sql, [username, chatId.toString(), now]);

      await bot.sendMessage(chatId, '✅ Akun Telegram Anda berhasil terhubung dengan username di website.');
    } catch (err) {
      console.error('❌ Error menyimpan mapping ke DB:', err);
      await bot.sendMessage(chatId, '❌ Gagal menghubungkan akun. Silakan coba lagi nanti.');
    }
  } else {
    await bot.sendMessage(chatId, 'Halo! Silakan klik tautan dari website untuk menghubungkan akun Telegram Anda.');
  }
});

module.exports = bot;
