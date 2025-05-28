const pool = require('../config/db');
const eventEmitter = require('../notification-handler/eventEmitter')

exports.updateWorkflowStep = async (req, res) => {
  try {
    console.log("==== UPDATE WORKFLOW STEP ====");
    console.log("ID Instance:", req.params.id);
    console.log("Body:", req.body);
    console.log("User:", req.user);

    const userId = req.user.id;
    const userRole = req.user.role;
    const instanceId = req.params.id; 
    const { action } = req.body;

    // Ambil nilai assigned_user_name dari form (jika dikirim)
    const assignedUserName = req.body.assigned_user_name ? req.body.assigned_user_name.trim() : '';
    console.log('isi assigned: ', req.body.assigned_user_name)

    // const assignName = req.user.namaLengkap;

    // Ambil instance workflow
    const [instances] = await pool.query(
      'SELECT * FROM workflow_instances WHERE id = ?',
      [instanceId]
    );
    if (instances.length === 0) {
      return res.status(404).json({ message: 'Workflow instance tidak ditemukan' });
    }
    const instance = instances[0];
    

    if (action === 'setuju' || action === 'tolak') {

      const payload = JSON.parse(instance.payload || '{}');
      const assignName = payload.namaLengkap;
      const notificationData = {
        instanceId,
        action,
        assigned_user_name: assignName
      };

      if (action === 'setuju') {
      

      const fieldMap = {
        username: 'username',
        namaLengkap: 'nama_lengkap',
        alamat: 'alamat',
        foto_profile: 'foto_profile',
        nik: 'nik',
        nip: 'nip',
        pangkat: 'pangkat',
        ruang: 'ruang',
        pendidikan: 'pendidikan',
        tempatTanggalLahir: 'tempat_tanggal_lahir',
        levelPk: 'level_pk',
        noStr: 'no_str',
        akhirStr: 'akhir_str',
        fileStr: 'file_str',
        noSipp: 'no_sipp',
        akhirSipp: 'akhir_sipp',
        fileSipp: 'file_sipp',
        jenisKetenagaan: 'jenis_ketenagaan',
      };

      const payload = JSON.parse(instance.payload || '{}');
      console.log('isi payload: ', payload);

      const entriesToUpdate = Object.entries(payload)
        .filter(([key, value]) => key !== 'username' && fieldMap[key] && value !== undefined && value !== '');

      if (entriesToUpdate.length === 0) {
        return res.status(400).json({ message: 'Tidak ada data valid untuk diupdate.' });
      }

      const setClauses = [];
      const values = [];
      for (const [key, value] of entriesToUpdate) {
        const column = fieldMap[key];
        setClauses.push(`${column} = ?`);
        values.push(value);
      }

      values.push(payload.username);

      const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE username = ?`;
      console.log('EXECUTE SQL:', sql, 'VALUES:', values);

      const [result] = await pool.query(sql, values);
      console.log('Rows affected:', result.affectedRows);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan atau data sama dengan sebelumnya.' });
      }

      await pool.query('UPDATE workflow_instances SET status = ? WHERE id = ?', ['completed', instanceId]);

      eventEmitter.emit('verifUpdate', { ...notificationData, status: 'completed' });
      return res.json({ message: 'Data berhasil disetujui dan disimpan ke tabel users' });

      }

    
    if (action === 'tolak') {
      await pool.query('Delete FROM workflow_instances WHERE id = ?', instanceId)
      
      eventEmitter.emit('verifUpdate', { ...notificationData, status: 'rejected' });
      return res.json({ message: 'Data anda ditolak, silahkan perbaiki data yang salah' });
    }
    }

    const [steps] = await pool.query(
      'SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_order = ?',
      [instance.workflow_id, instance.current_step_order]
    );

    const currentStep = steps[0] || {};
    
    // // Validasi: Pastikan user memiliki peran yang sesuai (harus sama dengan to_role)
    if (userRole !== currentStep.to_role && userRole !== 'super admin') {
      return res.status(403).json({ message: 'User tidak berhak memproses langkah ini' });
    }
    

    let filePath = null;
    if (req.file) {
      filePath = req.file.path;
    }

    filePath = filePath || '';
    
    await pool.query(
      'INSERT INTO workflow_instance_steps (workflow_instance_id, step_order, from_role, to_role, action_taken, acted_by, remarks, file_path, assigned_user_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [instanceId, instance.current_step_order, currentStep.from_role, currentStep.to_role, action, userId, '', filePath, assignedUserName]
    );
    
    let notificationData = {
      instanceId,
      workflowId: instance.workflow_id,
      currentStep: instance.current_step_order,
      action,
      assigned_user_name: assignedUserName
    };
    
    // Proses aksi berdasarkan action
    if (action === 'stop') {
      await pool.query(
        'UPDATE workflow_instances SET status = ? WHERE id = ?',
        ['completed', instanceId]
      );
      // Emit event update tugas (misalnya untuk notifikasi bahwa tugas sudah selesai)
      eventEmitter.emit('taskStepUpdated', { ...notificationData, status: 'completed' });
      return res.json({ message: 'Tugas telah dihentikan dan selesai.' });
    }
    
    if (action === 'approve') {
      console.log('masuk ke approve')
      if (currentStep.next_step_if_approved === null) {
        await pool.query(
          'UPDATE workflow_instances SET status = ? WHERE id = ?',
          ['completed', instanceId]
        );
        eventEmitter.emit('taskStepUpdated', { ...notificationData, status: 'completed' });
        return res.json({ message: 'Tugas selesai (approve).' });
      } else {
        // Proses update untuk langkah berikutnya
        await pool.query(
          'UPDATE workflow_instances SET current_step_order = ? WHERE id = ?',
          [currentStep.next_step_if_approved, instanceId]
        );
        // Emit event update untuk perpindahan ke langkah berikutnya
        eventEmitter.emit('taskStepUpdated', { ...notificationData, newStep: currentStep.next_step_if_approved });
        return res.json({ message: 'Tugas telah berpindah ke langkah berikutnya (approve).' });
      }
    }
    
    
    if (action === 'reject') {
      if (currentStep.next_step_if_rejected === null) {
        return res.status(400).json({ message: 'Reject tidak tersedia untuk langkah ini.' });
      } else {
        await pool.query(
          'UPDATE workflow_instances SET current_step_order = ? WHERE id = ?',
          [currentStep.next_step_if_rejected, instanceId]
        );
        // Emit event update untuk reject
        eventEmitter.emit('taskStepUpdated', { ...notificationData, newStep: currentStep.next_step_if_rejected });
        return res.json({ message: 'Tugas telah berpindah ke langkah berikutnya (reject).' });
      }
    }

    

    return res.status(400).json({ message: 'Aksi tidak valid.' });
    
  } catch (error) {
    console.error('Error updating workflow step:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userName = req.user.namaLengkap;

    console.log('nama lengkap user yang sedang login : ', req.user.namaLengkap)
    
    // Tugas yang diinisiasi oleh user (aktif)
    const [initiatedTasks] = await pool.query(
      `SELECT wi.*, w.code, w.title, w.description
       FROM workflow_instances wi
       JOIN workflows w ON wi.workflow_id = w.id
       WHERE wi.initiated_by = ?`,
       [userId]
    );

    // Tugas yang ditugaskan kepada user (aktif)
    const [assignedTasks] = await pool.query(
      `SELECT 
          wi.*, 
          w.code, 
          w.title, 
          w.description, 
          ws.action_description,
          ws.next_step_if_approved, 
          ws.next_step_if_rejected, 
          ws.no_need_next_step, 
          ws.to_role, 
          ws.from_role, 
          ws.step_order,
          (SELECT id FROM workflow_instance_steps 
            WHERE workflow_instance_id = wi.id AND file_path <> '' 
            ORDER BY step_order DESC LIMIT 1) AS last_step_id,
          (SELECT file_path FROM workflow_instance_steps 
            WHERE workflow_instance_id = wi.id AND file_path <> '' 
            ORDER BY step_order DESC LIMIT 1) AS file_path,
          (SELECT wis.assigned_user_name FROM workflow_instance_steps wis
            WHERE wis.workflow_instance_id = wi.id
            ORDER BY wis.step_order DESC LIMIT 1) as assigned_user_name
      FROM workflow_instances wi
      JOIN workflows w ON wi.workflow_id = w.id
      JOIN workflow_steps ws ON ws.workflow_id = wi.workflow_id AND ws.step_order = wi.current_step_order
      WHERE ws.to_role = ?
        AND wi.status != 'completed'
        AND (
              ( (SELECT wis.assigned_user_name 
                    FROM workflow_instance_steps wis
                    WHERE wis.workflow_instance_id = wi.id
                    ORDER BY wis.step_order DESC LIMIT 1) IS NULL 
                OR (SELECT wis.assigned_user_name 
                    FROM workflow_instance_steps wis
                    WHERE wis.workflow_instance_id = wi.id
                    ORDER BY wis.step_order DESC LIMIT 1) = '' )
            OR 
              ( (SELECT wis.assigned_user_name 
                    FROM workflow_instance_steps wis
                    WHERE wis.workflow_instance_id = wi.id
                    ORDER BY wis.step_order DESC LIMIT 1) = ? )
            )`,
      [userRole, userName]
    );

    
    // Tugas recent: Tampilkan riwayat aksi yang dilakukan oleh semua user dengan role yang sama
    const [recentTasks] = await pool.query(
      `SELECT wis.id as step_id, wis.workflow_instance_id, wis.step_order, wis.action_taken, 
            wis.acted_by, wis.acted_at, wi.status, w.code, w.title, w.description, wis.file_path,
            u.nama_lengkap, u.username
      FROM workflow_instance_steps wis
      JOIN workflow_instances wi ON wis.workflow_instance_id = wi.id
      JOIN workflows w ON wi.workflow_id = w.id
      JOIN users u ON wis.acted_by = u.id
      WHERE u.role = ?
      ORDER BY wis.acted_at DESC
      LIMIT 10`, 
       [userRole]
    );

    // percobaan dipindah kesini
    
    
    res.json({
      initiatedTasks,
      assignedTasks,
      recentTasks
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};







exports.initiateWorkflow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workflow_id } = req.body;
    
    // Ambil langkah pertama dari workflow (step_order = 1)
    const [steps] = await pool.query(
      'SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_order = 1',
      [workflow_id]
    );
    
    if (steps.length === 0) {
      return res.status(400).json({ message: 'Workflow template tidak valid' });
    }
    
    const firstStep = steps[0];
    
    // Validasi: Pastikan user memiliki role yang sesuai untuk inisiasi
    if (req.user.role !== firstStep.from_role) {
      return res.status(403).json({ message: 'User tidak berhak menginisiasi workflow ini' });
    }
    
    // Buat instance workflow baru dengan current_step_order = 1 dan status 'in-progress'
    const [result] = await pool.query(
      'INSERT INTO workflow_instances (workflow_id, initiated_by, current_step_order, status) VALUES (?, ?, 1, ?)',
      [workflow_id, userId, 'in-progress']
    );
    
    const instanceId = result.insertId;
    
    // Jika ada file yang diupload, simpan ke history (workflow_instance_steps)
    if (req.file) {
      await pool.query(
        'INSERT INTO workflow_instance_steps (workflow_instance_id, step_order, from_role, to_role, action_taken, acted_by, remarks, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [instanceId, 1, firstStep.from_role, firstStep.to_role, 'initiate', userId, '', req.file.path]
      );
    }
    
    console.log('Emitting newTaskInitiated event with data:', {
      instanceId,
      workflowId: workflow_id,
      firstStep
    });

    // Emit event tugas baru diinisiasi
    eventEmitter.emit('newTaskInitiated', {
      instanceId,
      workflowId: workflow_id,
      firstStep // mengirimkan data step awal jika dibutuhkan handler notifikasi
    });
    
    return res.status(201).json({ message: 'Workflow instance berhasil diinisiasi', instanceId });
  } catch (error) {
    console.error('Error initiating workflow:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




exports.getWorkflowTemplatesForInitiation = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Mengambil template workflow yang dapat diinisiasi oleh user berdasarkan role (step 1)
    const [templates] = await pool.query(
      `SELECT w.id as workflow_id, w.code, w.title, w.description, ws.action_description
       FROM workflows w
       JOIN workflow_steps ws ON w.id = ws.workflow_id
       WHERE ws.step_order = 1 AND ws.from_role = ?`,
      [userRole]
    );
    
    return res.json(templates);
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { stepId } = req.params;

    // Ambil informasi file berdasarkan stepId
    const [rows] = await pool.query(
      'SELECT file_path FROM workflow_instance_steps WHERE id = ?',
      [stepId]
    );

    if (rows.length === 0 || !rows[0].file_path) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }

    const filePath = rows[0].file_path;

    // Kirim file ke client
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error saat mengirim file:', err);
        res.status(500).json({ message: 'Gagal mengunduh file' });
      }
    });

  } catch (error) {
    console.error('Error di fungsi downloadFile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkflowStep = async (req, res) => {
  try {
    const { workflowId, stepOrder } = req.params;
    const [steps] = await pool.query(
      'SELECT * FROM workflow_steps WHERE workflow_id = ? AND step_order = ?',
      [workflowId, stepOrder]
    );
    
    if (steps.length === 0) {
      return res.status(404).json({ message: 'Step tidak ditemukan' });
    }
    
    return res.json(steps[0]);
  } catch (error) {
    console.error('Error fetching workflow step:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getInstances = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // 'super admin', 'staff', dst.

  // 1. Semua instance yang user inisiasi
  const [initiatedRows] = await pool.query(
    `SELECT wi.*, w.code, w.title
       FROM workflow_instances wi
       JOIN workflows w ON wi.workflow_id = w.id
      WHERE wi.initiated_by = ?`,
    [userId]
  );

  // 2. Semua instance yang perlu user review
  //    Di sini kita anggap: any in-progress instance where workflow_id=10 goes to 'super admin'
  let assignedRows = [];
  if (userRole === 'super admin') {
    const [rows] = await pool.query(
      `SELECT wi.*, wi.payload, w.code, w.title, w.description, ui.username AS initiator_username
         FROM workflow_instances wi
         JOIN workflows w ON wi.workflow_id = w.id
         JOIN users ui ON wi.initiated_by = ui.id
        WHERE wi.status = 'in-progress'
          AND wi.workflow_id = 10`
    );

    
    assignedRows = rows.map(row => {
      let parsedPayload = null;
      try {
        parsedPayload = row.payload ? JSON.parse(row.payload) : null;
      } catch (error) {
        console.error("Invalid JSON in payload:", row.payload);
      }
      return {
        ...row,
        payload: parsedPayload
      };
    });
    
  }

  // 3. Recent tasks yang sudah completed
  const [recentRows] = await pool.query(
    `SELECT wi.*, w.code, w.title, ui.username AS initiator_username, wi.reviewed_at
       FROM workflow_instances wi
       JOIN workflows w ON wi.workflow_id = w.id
       JOIN users ui ON wi.initiated_by = ui.id
      WHERE wi.status = 'completed'
        AND (wi.initiated_by = ? OR ? = 'super admin')`,
    [userId, userRole]
  );

  res.json({
    initiatedRows,
    assignedRows,
    recentRows
  });
};