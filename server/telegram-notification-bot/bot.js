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

async function askConnectTelegram(chatId, username, usersTele) {
  await bot.sendMessage(
    chatId,
    `Akun ini telah terdaftar dengan username ${usersTele}. apakah Anda tetap ingin menambahkan? (setuju/tidak)`
  );

  bot.once('message', async (msg) => {
    if (msg.chat.id !== chatId) return;

    const jawaban = msg.text.trim().toLowerCase();

    if (jawaban === 'setuju') {
      try {
        const now = new Date();
        const sql = `
          INSERT INTO user_telegram (user_id, telegram_id, linked_at)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            telegram_id = VALUES(telegram_id),
            linked_at   = VALUES(linked_at)
        `;
        await pool.query(sql, [username, chatId.toString(), now]);

        await bot.sendMessage(
          chatId,
          '✅ Akun Telegram Anda berhasil terhubung dengan username di website.'
        );
      } catch (err) {
        console.error('❌ Error menyimpan mapping ke DB:', err);
        await bot.sendMessage(
          chatId,
          '❌ Gagal menghubungkan akun. Silakan coba lagi nanti.'
        );
      }
    }
    else if (jawaban === 'tidak') {
      await bot.sendMessage(
        chatId,
        'Baik, proses ditolak. Tidak ada perubahan yang dilakukan.'
      );
    }
    else {
      await bot.sendMessage(
        chatId,
        'Maaf, saya tidak mengerti. Tolong jawab dengan “setuju” atau “tidak”.'
      );
      askConnectTelegram(chatId, username);
    }
  });
}


async function askMoveUsername(chatId, username) {
  await bot.sendMessage(
    chatId,
    'Username tersebut telah terdaftar di akun telegram lain, apakah anda ingin memindahkannya ke akun ini? (setuju/tidak)'
  );

  bot.once('message', async (msg) => {
    if (msg.chat.id !== chatId) return;

    const jawaban = msg.text.trim().toLowerCase();

    if (jawaban === 'setuju') {
      try {
        const sql = `
          UPDATE user_telegram 
          SET telegram_id = ? 
          WHERE user_id = ?
        `;
        await pool.query(sql, [chatId.toString(), username]);
        await bot.sendMessage(chatId, '✅ Akun Telegram Anda berhasil dipindahkan.');
      } catch (err) {
        console.error('❌ Error menyimpan mapping ke DB:', err);
        await bot.sendMessage(chatId, '❌ Gagal menghubungkan akun. Silakan coba lagi nanti.');
      }
    }
    else if (jawaban === 'tidak') {
      await bot.sendMessage(chatId, 'Baik, proses ditolak. Tidak ada perubahan yang dilakukan.');
    }
    else {
      await bot.sendMessage(chatId, 'Maaf, saya tidak mengerti. Tolong jawab dengan “setuju” atau “tidak”.');
      askMoveUsername(chatId, username);
    }
  });
}

async function askDeleteUser(chatId, user) {
  await bot.sendMessage(chatId, `Ingin melepaskan tautan ke akun ${user} di website?(setuju/tolak)`)
  bot.once('message', async (msg) => {
    if(msg.chat.id != chatId) return;

    const jawaban = msg.text.trim().toLowerCase();

    if(jawaban == 'setuju') {
      await pool.query(
        'DELETE FROM user_telegram WHERE telegram_id = ?',
        [chatId]
      )
      await bot.sendMessage(chatId, 'Berhasil melepaskan tautan akun!')
    }
    else if(jawaban == 'tolak') {
      await bot.sendMessage(chatId, 'Baik, proses dibatalkan!')
    } else {
      await bot.sendMessage(chatId, 'Maaf, saya tidak mengerti. tolong jawab dengan "setuju" atau "tidak".')
      askDeleteUser(chatId, user);
    }
  })
}

async function askDeleteUserAll(chatId, user) {
  await bot.sendMessage(chatId, 'anda memiliki beberapa akun yang tertaut. hapus semua atau beberapa?(semua/beberapa)')

  bot.once('message', async (msg) => {
    if(msg.chat.id != chatId) return;

    const jawaban = msg.text.trim().toLowerCase();

    if(jawaban == 'semua') {
      askDeleteUserAllAll(chatId);
    }
    else if(jawaban == 'beberapa') {
      await bot.sendMessage(chatId, 'Ketikkan 1 akun yang ingin anda hapus!')
      await bot.sendMessage(chatId, `berikut list user ${user}`);
      inputUserDelete(chatId);
    } else {
      await bot.sendMessage(chatId, 'Maaf, saya tidak mengerti. tolong jawab dengan "semua" atau "beberapa"!')
      askDeleteUserAll(chatId, user);
    }

  })
}

async function askDeleteUserAllAll (chatId) {
  await bot.sendMessage(chatId, 'Yakin ingin menghapus semua akun tertaut?(yakin/tidak)')

  bot.once('message', async (msg) => {
    if(msg.chat.id != chatId) return;

    const jawaban = msg.text.trim().toLocaleLowerCase();

    if(jawaban == 'yakin') {
      await pool.query(
        'DELETE FROM user_telegram WHERE telegram_id = ?',
        [chatId]
      )
      await bot.sendMessage(chatId, 'Berhasil menghapus semua akun yang tertaut!')
    }
    else if (jawaban == 'tidak') {
      await bot.sendMessage(chatId, 'Proses dibatalkan!')
    } else {
      await bot.sendMessage(chatId, 'Maaf, saya tidak mengerti. tolong jawab dengan "yakin" atau "tidak"!')
      askDeleteUserAllAll(chatId);
    }
  })
}

async function inputUserDelete(chatId) {
  bot.once('message', async (msg) => {

  const jawaban = msg.text.trim();
  const hasil = await pool.query(
    'SELECT * FROM user_telegram WHERE user_id = ?',
    [jawaban]
  )
  const hasilAkhir = hasil[0];
  console.log('isi hasil : ', hasilAkhir.length);

  if(hasilAkhir == 0) {
    await bot.sendMessage(chatId, 'Maaf, username yang anda masukkan tidak sesuai. silahkan masukkan kembali!')
    inputUserDelete(chatId);
  } else {
    await pool.query(
      'DELETE FROM user_telegram WHERE user_id = ?',
      [jawaban]
    )
    await bot.sendMessage(chatId, `Berhasil menghapus tautan dengan user ${jawaban}`);
  }

})
}


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
  const id = msg.from?.id;

  if (param && param.startsWith('link:')) {
    const username = param.split(':')[1];
    const user = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    const userTel = await pool.query(
      'SELECT * FROM user_telegram WHERE telegram_id = ?',
      [id]
    )
    const userId = await pool.query(
      'SELECT * FROM user_telegram WHERE user_id = ?',
      [username]
    )

    const users = user[0]?.[0]?.username || null;
    const usersTel = userTel[0]?.[0]?.user_id || null;
    const usersId = userId[0]?.[0]?.user_id || null;
    const userTele = userTel[0];
    const usersTele = userTele.map(userTel => userTel.user_id);

    if (users == null) {
      await bot.sendMessage(chatId, '❌ Tidak ada username yang terdaftar di website dengan username tersebut!');
    }
    else if (usersTel != null) {
      askConnectTelegram(chatId, username, usersTele);
    }
    else if (usersId != null) {
      askMoveUsername(chatId, username);
    } 
    else if (usersTel != null && usersId != null) {
      await bot.sendMessage(chatId, 'Tidak perlu mendaftar kembali, akun anda sudah terdaftar 😊')
    }else {
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
    const handledCommands = ['/start', '/register', '/detach'];

    const command = text.split(' ')[0];

    if (!handledCommands.includes(command)) {
      await bot.sendMessage(chatId, '❌ Perintah tersebut tidak tersedia di bot ini! Gunakan perintah /start, /register dan /detach');
    }
  }
});


bot.onText(/\/detach(?:\s+(.+))?/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const row = await pool.query(
      'SELECT * FROM user_telegram WHERE telegram_id = ?',
      [chatId]
    )

    const rows = row[0];
    const user = rows.map(row => row.user_id);

    if (rows.length == 1) {
      askDeleteUser(chatId, user);
    }
    else if(rows.length > 1) {
      askDeleteUserAll(chatId, user);
    }
  } catch(error) {
    await bot.sendMessage(chatId, 'Error saat melepaskan tautan akun!')
  }
});


module.exports = bot;
