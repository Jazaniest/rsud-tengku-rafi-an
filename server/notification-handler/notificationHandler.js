const eventEmitter = require('./eventEmitter');
const pool = require('../config/db');
const { sendNotification } = require('../utils/fcm');
const bot = require('../telegram-notification-bot/bot');

/**
 * Helper mengirim pesan Telegram ke array chat_id
 * @param {string[]} chatIdList
 * @param {{ title: string, body: string }} payload
 */
async function kirimTelegram(chatIdList, payload) {
  const { title, body } = payload;
  for (const chatId of chatIdList) {
    try {
      await bot.sendMessage(chatId, `<b>${title}</b>\n${body}`, { parse_mode: 'HTML' });
      console.log(`Telegram terkirim ke ${chatId}`);
    } catch (err) {
      console.error(`Gagal kirim Telegram ke ${chatId}:`, err.response?.body || err.message);
    }
  }
}

eventEmitter.on('newTaskInitiated', async (data) => {
  try {
    const { workflowId, firstStep, assignedUserName } = data;

    const tugas = await pool.query('SELECT title FROM workflows WHERE id = ?', [workflowId]);
    const judulTugas = tugas[0]?.[0]?.title;

    const payloadFCM = {
      notification: {
        title: 'Tugas Baru',
        body: `Anda menerima tugas baru untuk ${judulTugas}.`
      }
    };
    const payloadTelegram = {
      title: 'Tugas Baru',
      body: `Anda menerima tugas baru untuk ${judulTugas}. Silakan cek aplikasi.`
    };

    if (assignedUserName) {
      const [rowsFcm] = await pool.query(
        'SELECT fcm_token FROM users WHERE username = ? AND fcm_token IS NOT NULL',
        [assignedUserName]
      );
      const fcmTokens = rowsFcm.map(r => r.fcm_token);
      if (fcmTokens.length > 0) {
        await sendNotification(fcmTokens, payloadFCM);
        console.log(`FCM terkirim ke user ${assignedUserName}`);
      } else {
        console.log(`Tidak ada FCM token untuk user ${assignedUserName}`);
      }

      const sqlTelegramUser = `
        SELECT telegram_id
        FROM user_telegram
        WHERE user_id = ?
          AND telegram_id IS NOT NULL
      `;
      const [rowsTelegramUser] = await pool.query(sqlTelegramUser, [assignedUserName]);
      const chatIdListUser = rowsTelegramUser.map(r => r.telegram_id);
      if (chatIdListUser.length > 0) {
        await kirimTelegram(chatIdListUser, payloadTelegram);
      } else {
        console.log(`Tidak ada telegram_id untuk user ${assignedUserName}`);
      }

      return;
    }

    const targetRole = firstStep.to_role;

    const [rowsFcmRole] = await pool.query(
      'SELECT fcm_token FROM users WHERE role = ? AND fcm_token IS NOT NULL',
      [targetRole]
    );
    const fcmTokensRole = rowsFcmRole.map(r => r.fcm_token);
    if (fcmTokensRole.length > 0) {
      await sendNotification(fcmTokensRole, payloadFCM);
      console.log(`FCM terkirim ke role ${targetRole}`);
    } else {
      console.log(`Tidak ada FCM token untuk role ${targetRole}`);
    }

    const sqlTelegramRole = `
      SELECT utl.telegram_id
      FROM user_telegram AS utl
      JOIN users AS u ON u.username = utl.user_id
      WHERE u.role = ?
        AND utl.telegram_id IS NOT NULL
    `;
    const [rowsTelegramRole] = await pool.query(sqlTelegramRole, [targetRole]);
    const chatIdListRole = rowsTelegramRole.map(r => r.telegram_id);
    if (chatIdListRole.length > 0) {
      await kirimTelegram(chatIdListRole, payloadTelegram);
      console.log(`Telegram terkirim ke role ${targetRole}`);
    } else {
      console.log(`Tidak ada telegram_id untuk role ${targetRole}`);
    }

  } catch (err) {
    console.error('Error di handler newTaskInitiated (FCM+Telegram):', err);
  }
});

eventEmitter.on('startVerif', async (data) => {
  try {
    const { verificatorRole } = data;

    const [rowsFcm] = await pool.query(
      'SELECT fcm_token FROM users WHERE role = ? AND fcm_token IS NOT NULL',
      [verificatorRole]
    );
    const fcmTokens = rowsFcm.map(r => r.fcm_token);
    if (fcmTokens.length > 0) {
      await sendNotification(fcmTokens, {
        notification: {
          title: 'Tugas Verifikasi Baru',
          body: 'Anda menerima tugas verifikasi baru!'
        }
      });
      console.log(`FCM terkirim ke role ${verificatorRole}`);
    } else {
      console.log(`Tidak ada FCM token untuk role ${verificatorRole}`);
    }

    const sqlTelegram = `
      SELECT utl.telegram_id
      FROM user_telegram AS utl
      JOIN users AS u ON u.username = utl.user_id
      WHERE u.role = ?
        AND utl.telegram_id IS NOT NULL
    `;
    const [rowsTelegram] = await pool.query(sqlTelegram, [verificatorRole]);
    const chatIdList = rowsTelegram.map(r => r.telegram_id);
    if (chatIdList.length > 0) {
      await kirimTelegram(chatIdList, {
        title: 'Tugas Verifikasi Baru',
        body: 'Anda menerima tugas verifikasi baru!'
      });
      console.log(`Telegram terkirim ke role ${verificatorRole}`);
    } else {
      console.log(`Tidak ada telegram_id untuk role ${verificatorRole}`);
    }

  } catch (err) {
    console.error('Error di handler startVerif (FCM+Telegram):', err);
  }
});

eventEmitter.on('verifUpdate', async (data) => {
  try {
    const { assigned_user_name, status } = data;

    const [rowsFcm] = await pool.query(
      'SELECT fcm_token FROM users WHERE nama_lengkap = ? AND fcm_token IS NOT NULL',
      [assigned_user_name]
    );
    const fcmTokens = rowsFcm.map(r => r.fcm_token);
    if (fcmTokens.length > 0) {
      const payloadFcm = {
        notification: {
          title: status === 'completed' ? 'Verifikasi Diterima' : 'Verifikasi Ditolak',
          body: status === 'completed'
            ? 'Data verifikasi yang Anda ajukan telah diterima.'
            : 'Maaf, data verifikasi yang Anda ajukan ditolak.'
        }
      };
      await sendNotification(fcmTokens, payloadFcm);
      console.log(`FCM verifUpdate ke ${assigned_user_name}`);
    } else {
      console.log(`Tidak ada FCM token untuk ${assigned_user_name}`);
    }

    // ===> Telegram: cari telegram_id berdasarkan username (tapi yang kita punya adalah nama lengkap)
    // Karena user_telegram.user_id = username, kita perlu ambil username dulu dari tabel users
    // lalu cari mapping di user_telegram.
    const sqlTelegram = `
      SELECT utl.telegram_id
      FROM user_telegram AS utl
      JOIN users AS u ON u.username = utl.user_id
      WHERE u.nama_lengkap = ?
        AND utl.telegram_id IS NOT NULL
      LIMIT 1
    `;
    const [rowsTelegram] = await pool.query(sqlTelegram, [assigned_user_name]);
    const chatIdList = rowsTelegram.map(r => r.telegram_id);
    if (chatIdList.length > 0) {
      const payloadTelegram = {
        title: status === 'completed' ? 'Verifikasi Diterima' : 'Verifikasi Ditolak',
        body: status === 'completed'
          ? 'Data verifikasi yang Anda ajukan telah diterima.'
          : 'Data verifikasi yang Anda ajukan ditolak.'
      };
      await kirimTelegram(chatIdList, payloadTelegram);
      console.log(`Telegram verifUpdate ke ${assigned_user_name}`);
    } else {
      console.log(`Tidak ada telegram_id untuk ${assigned_user_name}`);
    }

  } catch (err) {
    console.error('Error di handler verifUpdate (FCM+Telegram):', err);
  }
});

eventEmitter.on('taskStepUpdated', async (data) => {
  try {
    const { workflowId, newStep, status, assigned_user_name } = data;

    let fcmTokens = [];
    let chatIdList = [];

    if (assigned_user_name && assigned_user_name.trim() !== '') {
      const [rowsFcm] = await pool.query(
        'SELECT fcm_token FROM users WHERE nama_lengkap = ? AND fcm_token IS NOT NULL',
        [assigned_user_name]
      );
      fcmTokens = rowsFcm.map(r => r.fcm_token);

      const sqlTelUser = `
        SELECT utl.telegram_id
        FROM user_telegram AS utl
        JOIN users AS u ON u.username = utl.user_id
        WHERE u.nama_lengkap = ?
          AND utl.telegram_id IS NOT NULL
        LIMIT 1
      `;
      const [rowsTelUser] = await pool.query(sqlTelUser, [assigned_user_name]);
      chatIdList = rowsTelUser.map(r => r.telegram_id);

      if (fcmTokens.length > 0) {
        console.log(`FCM akan dikirim ke user ${assigned_user_name}`);
      } else {
        console.log(`Tidak ada FCM token untuk ${assigned_user_name}`);
      }
      if (chatIdList.length > 0) {
        console.log(`Telegram akan dikirim ke user ${assigned_user_name}`);
      } else {
        console.log(`Tidak ada telegram_id untuk ${assigned_user_name}`);
      }
    }

    if (fcmTokens.length === 0 || chatIdList.length === 0) {
      const [rowsStep] = await pool.query(
        'SELECT to_role FROM workflow_steps WHERE workflow_id = ? AND step_order = ? LIMIT 1',
        [workflowId, newStep]
      );
      if (rowsStep.length === 0) {
        console.log('⚠️ Target role tidak ditemukan, notifikasi tidak dikirim.');
        return;
      }
      const targetRole = rowsStep[0].to_role;
      console.log(`Notifikasi fallback ke role ${targetRole}`);

      if (fcmTokens.length === 0) {
        const [rowsFcmRole] = await pool.query(
          'SELECT fcm_token FROM users WHERE role = ? AND fcm_token IS NOT NULL',
          [targetRole]
        );
        fcmTokens = rowsFcmRole.map(r => r.fcm_token);
        if (fcmTokens.length > 0) {
          console.log(`FCM fallback ke role ${targetRole}`);
        } else {
          console.log(`Tidak ada FCM token untuk role ${targetRole}`);
        }
      }

      if (chatIdList.length === 0) {
        const sqlTelRole = `
          SELECT utl.telegram_id
          FROM user_telegram AS utl
          JOIN users AS u ON u.username = utl.user_id
          WHERE u.role = ?
            AND utl.telegram_id IS NOT NULL
        `;
        const [rowsTelRole] = await pool.query(sqlTelRole, [targetRole]);
        chatIdList = rowsTelRole.map(r => r.telegram_id);
        if (chatIdList.length > 0) {
          console.log(`Telegram fallback ke role ${targetRole}`);
        } else {
          console.log(`Tidak ada telegram_id untuk role ${targetRole}`);
        }
      }
    }

    if (fcmTokens.length > 0) {
      const payloadFcm = {
        notification: {
          title: status === 'completed' ? 'Tugas Selesai' : 'Tugas Baru',
          body: status === 'completed'
            ? 'Sebuah tugas telah selesai diproses.'
            : 'Anda menerima tugas baru, silakan cek aplikasi.'
        }
      };
      await sendNotification(fcmTokens, payloadFcm);
      console.log('FCM taskStepUpdated terkirim');
    }

    if (chatIdList.length > 0) {
      const payloadTelegram = {
        title: status === 'completed' ? 'Tugas Selesai' : 'Tugas Baru',
        body: status === 'completed'
          ? 'Sebuah tugas telah selesai diproses.'
          : 'Anda menerima tugas baru, silakan cek aplikasi.'
      };
      await kirimTelegram(chatIdList, payloadTelegram);
      console.log('➡️ Telegram taskStepUpdated terkirim');
    }

  } catch (err) {
    console.error('Error di handler taskStepUpdated (FCM+Telegram):', err);
  }
});
