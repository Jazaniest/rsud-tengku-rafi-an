// server/notificationHandler.js
const eventEmitter = require('./eventEmitter');
const { sendNotification } = require('../utils/fcm');
const pool = require('../config/db'); // pastikan modul database Anda

// Handler untuk event newTaskInitiated
eventEmitter.on('newTaskInitiated', async (data) => {
  try {
    const { instanceId, workflowId, firstStep } = data;
    // Misalnya, target notifikasi berdasarkan firstStep.to_role
    const targetRole = firstStep.to_role;
    
    // Query token FCM user yang sesuai (asumsikan tabel users memiliki field fcm_token)
    const [tokens] = await pool.query('SELECT fcm_token FROM users WHERE role = ?', [targetRole]);
    const tokenList = tokens.map(row => row.fcm_token).filter(Boolean);
    
    if (tokenList.length === 0) {
      console.log(`Tidak ada token FCM untuk role ${targetRole}`);
      return;
    }
    
    const payload = {
      notification: {
        title: 'Tugas Baru',
        body: 'Anda menerima tugas baru, silahkan cek aplikasi.'
      }
    };
    
    await sendNotification(tokenList, payload);
    console.log(`Notifikasi tugas baru untuk role ${targetRole} telah dikirim.`);
  } catch (error) {
    console.error('Error saat mengirim notifikasi untuk tugas baru:', error);
  }
});

// Handler untuk event taskStepUpdated
// Handler untuk event taskStepUpdated
eventEmitter.on('taskStepUpdated', async (data) => {
  try {
    const { instanceId, workflowId, currentStep, action, newStep, status, assigned_user_name } = data;
    console.log('isi assigned_user_name di handler : ', assigned_user_name);
    
    let targetTokens = [];
    
    // Jika assigned_user_name terisi, query token berdasarkan nama lengkap user
    if (assigned_user_name && assigned_user_name.trim() !== "") {
      const [users] = await pool.query('SELECT fcm_token FROM users WHERE nama_lengkap = ?', [assigned_user_name]);
      targetTokens = users.map(row => row.fcm_token).filter(Boolean);
      if (targetTokens.length > 0) {
        console.log(`Notifikasi akan dikirim ke user dengan nama ${assigned_user_name}`);
      } else {
        console.log(`Tidak ada token FCM untuk user dengan nama ${assigned_user_name}`);
      }
    }
    
    // Jika token belum ditemukan atau assigned_user_name kosong, fallback ke target role
    if (targetTokens.length === 0) {
      let targetRole;
      if (newStep) {
        // Ambil to_role dari langkah baru
        const [steps] = await pool.query('SELECT to_role FROM workflow_steps WHERE workflow_id = ? AND step_order = ?', [workflowId, newStep]);
        if (steps.length > 0) {
          targetRole = steps[0].to_role;
        }
      }
      if (!targetRole) {
        console.log('Target role tidak dapat ditentukan, notifikasi tidak dikirim.');
        return;
      }
      
      // Query token FCM berdasarkan role
      const [tokens] = await pool.query('SELECT fcm_token FROM users WHERE role = ?', [targetRole]);
      targetTokens = tokens.map(row => row.fcm_token).filter(Boolean);
      console.log(`Notifikasi fallback akan dikirim ke role ${targetRole}`);
    }
    
    if (targetTokens.length === 0) {
      console.log(`Tidak ada token FCM yang ditemukan, notifikasi tidak dikirim.`);
      return;
    }
    
    // Sesuaikan payload berdasarkan status atau action
    let payload;
    if (status === 'completed') {
      payload = {
        notification: {
          title: 'Tugas Selesai',
          body: 'Sebuah tugas telah selesai diproses.'
        }
      };
    } else {
      payload = {
        notification: {
          title: 'Tugas Baru',
          body: 'Anda menerima tugas baru, silahkan cek aplikasi.'
        }
      };
    }
    
    await sendNotification(targetTokens, payload);
    console.log(`Notifikasi update tugas telah dikirim kepada ${assigned_user_name ? assigned_user_name : 'role tertentu'}.`);
  } catch (error) {
    console.error('Error saat mengirim notifikasi update tugas:', error);
  }
});

