const fs = require('fs');

const serverFile = 'C:/Users/Shobha/OneDrive/Desktop/NBT HUB/backend/backend/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

// 1. Update lookups in getAssetValue
const oldLookups = `  const lookups = {
    laptop_details: ['laptopdetails', 'laptop', 'laptop_details'],
    mouse: ['mouse', 'hasmouse', 'mouse_status'],
    keyboard: ['keyboard', 'haskeyboard', 'keyboard_status'],
    laptop_stand: ['laptopstand', 'haslaptopstand', 'laptop_stand', 'stand'],
    ruf_pad: ['rufpad', 'hasrufpad', 'ruf_pad'],
    pendrive: ['pendrive', 'haspendrive'],
    mobile: ['mobile', 'hasmobile', 'companymobile', 'hascompanymobile', 'company_mobile', 'mobile_handset'],
    camera: ['camera', 'hascamera', 'externalcamera', 'hasexternalcamera', 'external_camera', 'webcam'],
    earphone_headphone: ['earphoneheadphone', 'hasearphoneheadphone', 'earphone', 'hasearphone', 'earphone_headphone', 'headphone', 'headphones', 'earphones'],
    tablet: ['tablet', 'hastablet']
  };`;

const newLookups = `  const lookups = {
    laptop_details: ['laptopdetails', 'laptop', 'laptop_details', 'assetname', 'asset_name', 'brand'],
    mouse: ['mouse', 'hasmouse', 'mouse_status', 'opticalmouse', 'optical_mouse'],
    keyboard: ['keyboard', 'haskeyboard', 'keyboard_status', 'externalkeyboard', 'external_keyboard'],
    laptop_stand: ['laptopstand', 'haslaptopstand', 'laptop_stand', 'stand'],
    ruf_pad: ['rufpad', 'hasrufpad', 'ruf_pad', 'rufpadnotebook', 'ruf_pad_notebook', 'notebook', 'refpad', 'ref_pad'],
    pendrive: ['pendrive', 'haspendrive', 'pendrivestorage', 'pendrive_storage', 'storage'],
    mobile: ['mobile', 'hasmobile', 'companymobile', 'hascompanymobile', 'company_mobile', 'mobile_handset'],
    camera: ['camera', 'hascamera', 'externalcamera', 'hasexternalcamera', 'external_camera', 'webcam'],
    earphone_headphone: ['earphoneheadphone', 'hasearphoneheadphone', 'earphone', 'hasearphone', 'earphone_headphone', 'headphone', 'headphones', 'earphones'],
    tablet: ['tablet', 'hastablet']
  };`;

if (content.includes(oldLookups)) {
  content = content.replace(oldLookups, newLookups);
  console.log('Updated getAssetValue lookups');
} else {
  console.warn('Could not find oldLookups');
}

// 2. Update addCertAssetsToStock for idempotency
const oldStockQuery = `    await stockReq.query(\`
      INSERT INTO assets_stock (
        laptop_details, mouse, keyboard, laptop_stand, ruf_pad, 
        pendrive, mobile, camera, earphone_headphone, tablet,
        returned_by_employee_id, returned_by_name, returned_by_designation,
        returned_date, created_at, updated_at
      ) VALUES (
        @laptop_details, @mouse, @keyboard, @laptop_stand, @ruf_pad, 
        @pendrive, @mobile, @camera, @earphone_headphone, @tablet,
        @returned_by_employee_id, @returned_by_name, @returned_by_designation,
        GETDATE(), GETDATE(), GETDATE()
      )
    \`);
    console.log(\`[CERT APPROVE] Assets added to stock (with employee audit) for cert request: \${cert.id}\`);`;

const newStockQuery = `    // Idempotency: Check if this declaration/cert already credited stock
    if (cert && cert.id) {
      const checkCredited = await pool.request()
        .input('certId', sql.Int, cert.id)
        .query("SELECT admin_remark FROM service_certificate_requests WHERE id = @certId");
      if (checkCredited.recordset[0]?.admin_remark?.includes('[STOCK_CREDITED]')) {
        console.log(\`[CERT APPROVE] Stock already credited for certificate request ID: \${cert.id}\`);
        return;
      }
    }

    await stockReq.query(\`
      INSERT INTO assets_stock (
        laptop_details, mouse, keyboard, laptop_stand, ruf_pad, 
        pendrive, mobile, camera, earphone_headphone, tablet,
        returned_by_employee_id, returned_by_name, returned_by_designation,
        returned_date, created_at, updated_at
      ) VALUES (
        @laptop_details, @mouse, @keyboard, @laptop_stand, @ruf_pad, 
        @pendrive, @mobile, @camera, @earphone_headphone, @tablet,
        @returned_by_employee_id, @returned_by_name, @returned_by_designation,
        GETDATE(), GETDATE(), GETDATE()
      )
    \`);
    console.log(\`[CERT APPROVE] Assets added to stock (with employee audit) for cert request: \${cert.id}\`);

    // Mark cert request as stock credited
    if (cert && cert.id) {
      await pool.request()
        .input('certId', sql.Int, cert.id)
        .query("UPDATE service_certificate_requests SET admin_remark = ISNULL(admin_remark, '') + ' [STOCK_CREDITED]', updated_at = GETDATE() WHERE id = @certId AND (admin_remark IS NULL OR admin_remark NOT LIKE '%[STOCK_CREDITED]%')");
    }`;

if (content.includes(oldStockQuery)) {
  content = content.replace(oldStockQuery, newStockQuery);
  console.log('Updated addCertAssetsToStock with idempotency');
} else {
  console.warn('Could not find oldStockQuery');
}

// 3. Update POST /api/service-certificates
const oldPost = `app.post(['/api/service-certificates', '/api/service_certificate_requests'], verifyToken, async (req, res) => {
  const {
    purpose, designation, laptopDetails, serialNumber,
    hasMouse, hasKeyboard, hasLaptopStand, hasRufPad,
    hasPendrive, hasCompanyMobile, hasExternalCamera,
    hasEarphoneHeadphone, hasTablet
  } = req.body;
  const userId = req.user.id;

  if (!purpose) {
    return res.status(400).json({ error: 'Purpose of request is mandatory.' });
  }

  try {
    const pool = await getPool();

    // Capture the current designation if not provided (fallback to users table)
    let finalDesignation = designation;
    if (!finalDesignation) {
      const userResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT role FROM users WHERE id = @userId');
      finalDesignation = userResult.recordset[0]?.role || 'Employee';
    }

    await pool.request()
      .input('employee_id', sql.Int, userId)
      .input('purpose', sql.NVarChar, purpose)
      .input('designation', sql.NVarChar, finalDesignation)
      .input('laptop', sql.NVarChar, laptopDetails || null)
      .input('serial', sql.NVarChar, serialNumber || null)
      // Asset Columns
      .input('mouse', sql.Bit, hasMouse ? 1 : 0)
      .input('keyboard', sql.Bit, hasKeyboard ? 1 : 0)
      .input('laptop_stand', sql.Bit, hasLaptopStand ? 1 : 0)
      .input('ruf_pad', sql.Bit, hasRufPad ? 1 : 0)
      .input('pendrive', sql.Bit, hasPendrive ? 1 : 0)
      .input('company_mobile', sql.Bit, hasCompanyMobile ? 1 : 0)
      .input('external_camera', sql.Bit, hasExternalCamera ? 1 : 0)
      .input('earphone_headphone', sql.Bit, hasEarphoneHeadphone ? 1 : 0)
      .input('tablet', sql.Bit, hasTablet ? 1 : 0)
      .query(\`
        INSERT INTO service_certificate_requests 
          (employee_id, purpose, designation_at_request, laptop_details, serial_number, mouse, keyboard, laptop_stand, ruf_pad, pendrive, company_mobile, external_camera, earphone_headphone, tablet, hr_status, pm_status, created_at, updated_at)
        VALUES 
          (@employee_id, @purpose, @designation, @laptop, @serial, @mouse, @keyboard, @laptop_stand, @ruf_pad, @pendrive, @company_mobile, @external_camera, @earphone_headphone, @tablet, 'Pending', 'Pending', GETDATE(), GETDATE())
      \`);

    res.status(201).json({ success: true, message: 'Service certificate application submitted successfully.' });
  } catch (err) {
    console.error('[SERVICE CERTIFICATE SUBMIT ERROR]:', err);
    res.status(500).json({ error: 'Failed to submit service certificate application' });
  }
});`;

const newPost = `app.post(['/api/service-certificates', '/api/service_certificate_requests'], verifyToken, async (req, res) => {
  const purpose = req.body.purpose;
  const designation = req.body.designation || req.body.designation_at_request;
  const laptopDetails = req.body.laptopDetails || req.body.laptop_details || req.body.asset_name;
  const serialNumber = req.body.serialNumber || req.body.serial_number || req.body.serial_no || req.body.asset_serial_no;
  const isT = (v) => v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 'yes';
  const hasMouse = isT(req.body.hasMouse ?? req.body.has_mouse ?? req.body.mouse);
  const hasKeyboard = isT(req.body.hasKeyboard ?? req.body.has_keyboard ?? req.body.keyboard);
  const hasLaptopStand = isT(req.body.hasLaptopStand ?? req.body.has_laptop_stand ?? req.body.laptop_stand);
  const hasRufPad = isT(req.body.hasRufPad ?? req.body.has_ruf_pad ?? req.body.ruf_pad);
  const hasPendrive = isT(req.body.hasPendrive ?? req.body.has_pendrive ?? req.body.pendrive);
  const hasCompanyMobile = isT(req.body.hasCompanyMobile ?? req.body.has_company_mobile ?? req.body.company_mobile ?? req.body.mobile);
  const hasExternalCamera = isT(req.body.hasExternalCamera ?? req.body.has_external_camera ?? req.body.external_camera ?? req.body.camera);
  const hasEarphoneHeadphone = isT(req.body.hasEarphoneHeadphone ?? req.body.has_earphone_headphone ?? req.body.earphone_headphone ?? req.body.earphone);
  const hasTablet = isT(req.body.hasTablet ?? req.body.has_tablet ?? req.body.tablet);

  const userId = req.user.id;
  const targetEmpId = req.body.employee_id ? sanitizeNumericId(req.body.employee_id) : userId;

  if (!purpose) {
    return res.status(400).json({ error: 'Purpose of request is mandatory.' });
  }

  try {
    const pool = await getPool();

    // Capture the current designation if not provided (fallback to users table)
    let finalDesignation = designation;
    if (!finalDesignation) {
      const userResult = await pool.request()
        .input('userId', sql.Int, targetEmpId || userId)
        .query('SELECT role FROM users WHERE id = @userId');
      finalDesignation = userResult.recordset[0]?.role || 'Employee';
    }

    // Check if an existing declaration record exists for this employee
    const isAssetDeclaration = purpose === 'Professional Asset Declaration';
    let existingId = req.body.id ? sanitizeNumericId(req.body.id) : null;
    if (!existingId && isAssetDeclaration) {
      const findExisting = await pool.request()
        .input('empId', sql.Int, targetEmpId || userId)
        .query("SELECT TOP 1 id, admin_remark FROM service_certificate_requests WHERE employee_id = @empId AND purpose = 'Professional Asset Declaration' ORDER BY created_at DESC");
      if (findExisting.recordset.length > 0) {
        existingId = findExisting.recordset[0].id;
      }
    }

    let recordId = existingId;

    if (existingId) {
      await pool.request()
        .input('id', sql.Int, existingId)
        .input('designation', sql.NVarChar, finalDesignation)
        .input('laptop', sql.NVarChar, laptopDetails || null)
        .input('serial', sql.NVarChar, serialNumber || null)
        .input('mouse', sql.Bit, hasMouse ? 1 : 0)
        .input('keyboard', sql.Bit, hasKeyboard ? 1 : 0)
        .input('laptop_stand', sql.Bit, hasLaptopStand ? 1 : 0)
        .input('ruf_pad', sql.Bit, hasRufPad ? 1 : 0)
        .input('pendrive', sql.Bit, hasPendrive ? 1 : 0)
        .input('company_mobile', sql.Bit, hasCompanyMobile ? 1 : 0)
        .input('external_camera', sql.Bit, hasExternalCamera ? 1 : 0)
        .input('earphone_headphone', sql.Bit, hasEarphoneHeadphone ? 1 : 0)
        .input('tablet', sql.Bit, hasTablet ? 1 : 0)
        .query(\`
          UPDATE service_certificate_requests 
          SET designation_at_request = @designation,
              laptop_details = @laptop,
              serial_number = @serial,
              mouse = @mouse,
              keyboard = @keyboard,
              laptop_stand = @laptop_stand,
              ruf_pad = @ruf_pad,
              pendrive = @pendrive,
              company_mobile = @company_mobile,
              external_camera = @external_camera,
              earphone_headphone = @earphone_headphone,
              tablet = @tablet,
              updated_at = GETDATE()
          WHERE id = @id
        \`);
    } else {
      const insertResult = await pool.request()
        .input('employee_id', sql.Int, targetEmpId || userId)
        .input('purpose', sql.NVarChar, purpose)
        .input('designation', sql.NVarChar, finalDesignation)
        .input('laptop', sql.NVarChar, laptopDetails || null)
        .input('serial', sql.NVarChar, serialNumber || null)
        .input('mouse', sql.Bit, hasMouse ? 1 : 0)
        .input('keyboard', sql.Bit, hasKeyboard ? 1 : 0)
        .input('laptop_stand', sql.Bit, hasLaptopStand ? 1 : 0)
        .input('ruf_pad', sql.Bit, hasRufPad ? 1 : 0)
        .input('pendrive', sql.Bit, hasPendrive ? 1 : 0)
        .input('company_mobile', sql.Bit, hasCompanyMobile ? 1 : 0)
        .input('external_camera', sql.Bit, hasExternalCamera ? 1 : 0)
        .input('earphone_headphone', sql.Bit, hasEarphoneHeadphone ? 1 : 0)
        .input('tablet', sql.Bit, hasTablet ? 1 : 0)
        .query(\`
          INSERT INTO service_certificate_requests 
            (employee_id, purpose, designation_at_request, laptop_details, serial_number, mouse, keyboard, laptop_stand, ruf_pad, pendrive, company_mobile, external_camera, earphone_headphone, tablet, hr_status, pm_status, created_at, updated_at)
          OUTPUT INSERTED.id
          VALUES 
            (@employee_id, @purpose, @designation, @laptop, @serial, @mouse, @keyboard, @laptop_stand, @ruf_pad, @pendrive, @company_mobile, @external_camera, @earphone_headphone, @tablet, 'Pending', 'Pending', GETDATE(), GETDATE())
        \`);
      recordId = insertResult.recordset[0]?.id;
    }

    // Automatically credit hardware declaration to stock inventory upon finalization
    if (isAssetDeclaration) {
      const certRecord = {
        id: recordId,
        employee_id: targetEmpId || userId,
        laptop_details: laptopDetails,
        serial_number: serialNumber
      };
      await addCertAssetsToStock(pool, certRecord, req.body);
    }

    res.status(201).json({ success: true, message: 'Hardware declaration submitted successfully.', id: recordId });
  } catch (err) {
    console.error('[SERVICE CERTIFICATE SUBMIT ERROR]:', err);
    res.status(500).json({ error: 'Failed to submit service certificate application' });
  }
});`;

if (content.includes(oldPost)) {
  content = content.replace(oldPost, newPost);
  console.log('Updated POST /api/service-certificates');
} else {
  console.warn('Could not find oldPost');
}

// 4. Update PUT /api/service-certificates
const oldPutCheck = `        // Automatically add pledged assets to stock table if status is Approved
        const checkHR = finalHRStatus || certificate.hr_status;
        const checkPM = finalPMStatus || certificate.pm_status;
        const isNewlyApproved = (checkHR === 'Approved' && checkPM === 'Approved') && (certificate.hr_status !== 'Approved' || certificate.pm_status !== 'Approved');
        if (isNewlyApproved) {
          await addCertAssetsToStock(transaction, certificate, req.body);
        }`;

const newPutCheck = `        // Automatically add pledged assets to stock table if status is Approved OR if finalized hardware declaration
        const checkHR = finalHRStatus || certificate.hr_status;
        const checkPM = finalPMStatus || certificate.pm_status;
        const isNewlyApproved = (checkHR === 'Approved' && checkPM === 'Approved') && (certificate.hr_status !== 'Approved' || certificate.pm_status !== 'Approved');
        const isDeclaration = (purpose === 'Professional Asset Declaration' || certificate.purpose === 'Professional Asset Declaration' || req.body.purpose === 'Professional Asset Declaration');
        if (isNewlyApproved || isDeclaration) {
          await addCertAssetsToStock(transaction, certificate, req.body);
        }`;

if (content.includes(oldPutCheck)) {
  content = content.replace(oldPutCheck, newPutCheck);
  console.log('Updated PUT /api/service-certificates (update path)');
} else {
  console.warn('Could not find oldPutCheck');
}

const oldPutInsertCheck = `        if (initialHRStatus === 'Approved' && initialPMStatus === 'Approved') {
          const certRecord = { id: newId, employee_id: actualEmpId };
          await addCertAssetsToStock(transaction, certRecord, req.body);
        }`;

const newPutInsertCheck = `        const isDeclaration = (finalPurpose === 'Professional Asset Declaration' || req.body.purpose === 'Professional Asset Declaration');
        if ((initialHRStatus === 'Approved' && initialPMStatus === 'Approved') || isDeclaration) {
          const certRecord = { id: newId, employee_id: actualEmpId };
          await addCertAssetsToStock(transaction, certRecord, req.body);
        }`;

if (content.includes(oldPutInsertCheck)) {
  content = content.replace(oldPutInsertCheck, newPutInsertCheck);
  console.log('Updated PUT /api/service-certificates (insert path)');
} else {
  console.warn('Could not find oldPutInsertCheck');
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('server.js updated successfully!');

