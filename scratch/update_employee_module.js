const fs = require('fs');

const hrFile = 'c:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/hr/src/components/profile/EmployeeModule.js';
const pmFile = 'c:/Users/Shobha/OneDrive/Desktop/NBT HUB/NBT_HUB_OG/NBT_HUB_OG/src/modules/pm/src/components/profile/EmployeeModule.js';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Normalize CRLF to LF for reliable replacements
  const isCRLF = content.includes('\r\n');
  if (isCRLF) {
    content = content.replace(/\r\n/g, '\n');
  }

  // 1. Update imports
  const oldImport = "import { ArrowLeft, ChevronDown } from 'lucide-react';";
  const newImport = "import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';\nimport { BASE_URL } from '../../config';";

  if (!content.includes(oldImport)) {
    console.error('Error: oldImport not found in ' + filePath);
    process.exit(1);
  }
  content = content.replace(oldImport, newImport);

  // 2. Add computeAge helper at top
  const helperCode = `function computeAgeFromDob(dob) {
  if (!dob) return '-';
  const clean = String(dob).trim();
  const digits = clean.replace(/\\D/g, '');
  let birthDate = null;
  if (digits.length === 8 && (clean.includes('/') || clean.includes('-'))) {
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts[0].length === 4) birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      else birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0].length === 4) birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      else birthDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  } else {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) birthDate = d;
  }
  if (!birthDate || isNaN(birthDate.getTime())) return '-';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return (age >= 0 && age < 120) ? String(age) : '-';
}

`;

  content = helperCode + content;

  // 3. Add states and handleCardClick
  const stateAnchor = "const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);";
  const newStates = `const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [profileDetails, setProfileDetails] = useState({});
  const [loadingProfileId, setLoadingProfileId] = useState(null);

  const handleCardClick = async (emp) => {
    const empId = String(emp.id || emp.employee_id || emp.EmpID || '').trim();
    if (!empId) return;

    if (selectedEmpId === empId) {
      setSelectedEmpId(null);
      return;
    }

    setSelectedEmpId(empId);

    if (profileDetails[empId]) return;

    // Check cached profile in sessionStorage
    const cacheKeyHr = 'profile_cache_hr_' + empId;
    const cacheKeyPm = 'profile_cache_pm_' + empId;
    let cached = null;
    try {
      const rawCached = sessionStorage.getItem(cacheKeyHr) || sessionStorage.getItem(cacheKeyPm);
      if (rawCached) cached = JSON.parse(rawCached);
    } catch (e) {}

    if (cached) {
      const rawAge = cached.age || cached.Age;
      const rawDob = cached.date_of_birth || cached.dob || cached.DateOfBirth;
      const calcAge = rawAge && String(rawAge).trim() !== '' ? String(rawAge).trim() : computeAgeFromDob(rawDob);

      setProfileDetails(prev => ({
        ...prev,
        [empId]: {
          name: cached.emp_name || cached.name || cached.base_name || emp.name || '-',
          gender: cached.gender || cached.Gender || '-',
          age: calcAge || '-',
          bloodGroup: cached.blood_group || cached.bloodgroup || cached.BloodGroup || '-',
          emergencyContact: cached.emergency_contact_no || cached.emergency_contact || cached.emergencyContactNo || '-'
        }
      }));
    }

    setLoadingProfileId(empId);
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await fetch(\`\${BASE_URL}/api/employee-profile/\${empId}\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });

      if (res.ok) {
        const resp = await res.json();
        let p = resp.data || resp.profile || resp.record || resp;
        if (Array.isArray(p)) p = p[0];

        if (p && typeof p === 'object') {
          const rawAge = p.age || p.Age;
          const rawDob = p.date_of_birth || p.dob || p.DateOfBirth;
          const calcAge = rawAge && String(rawAge).trim() !== '' ? String(rawAge).trim() : computeAgeFromDob(rawDob);

          const info = {
            name: p.emp_name || p.name || p.base_name || emp.name || '-',
            gender: p.gender || p.Gender || '-',
            age: calcAge || '-',
            bloodGroup: p.blood_group || p.bloodgroup || p.BloodGroup || '-',
            emergencyContact: p.emergency_contact_no || p.emergency_contact || p.emergencyContactNo || '-'
          };

          setProfileDetails(prev => ({ ...prev, [empId]: info }));
        }
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setLoadingProfileId(null);
    }
  };`;

  content = content.replace(stateAnchor, newStates);

  // 4. Update the card JSX start
  const cardOldSnippet = `            {filteredEmployees.map((emp, i) => (
              <div
                key={i}
                className="team-card-static"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: winWidth < 480 ? '20px' : '40px',
                  border: '1px solid #1e3a8a',
                  background: 'var(--white)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'default'
                }}
              >`;

  const cardNewSnippet = `            {filteredEmployees.map((emp, i) => {
              const empId = String(emp.id || emp.employee_id || emp.EmpID || '').trim();
              const isSelected = selectedEmpId === empId;
              const details = profileDetails[empId] || {
                name: emp.name || '-',
                gender: '-',
                age: '-',
                bloodGroup: '-',
                emergencyContact: '-'
              };
              const isLoading = loadingProfileId === empId;

              return (
                <div
                  key={i}
                  onClick={() => handleCardClick(emp)}
                  className="team-card-static"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: winWidth < 480 ? '20px' : '40px',
                    border: isSelected ? '2px solid #1e3a8a' : '1px solid #1e3a8a',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius)',
                    boxShadow: isSelected ? '0 10px 25px -5px rgba(30, 58, 138, 0.2)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ position: 'absolute', top: winWidth < 480 ? '14px' : '18px', right: winWidth < 480 ? '14px' : '18px', color: '#64748b' }}>
                    {isSelected ? <ChevronUp size={winWidth < 480 ? 16 : 20} color="#1e3a8a" /> : <ChevronDown size={winWidth < 480 ? 16 : 20} />}
                  </div>`;

  if (!content.includes(cardOldSnippet)) {
    console.error('Error: cardOldSnippet not found in ' + filePath);
    process.exit(1);
  }
  content = content.replace(cardOldSnippet, cardNewSnippet);

  // 5. Update card bottom
  const cardClosingOld = `                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: winWidth < 480 ? '11px' : '14px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: winWidth < 480 ? '12px' : '16px', flexShrink: 0 }}>🆔</span> <span>{emp.id}</span>
                  </div>
                </div>


              </div>
            ))}`;

  const cardClosingNew = `                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: winWidth < 480 ? '11px' : '14px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: winWidth < 480 ? '12px' : '16px', flexShrink: 0 }}>🆔</span> <span>{emp.id}</span>
                  </div>
                </div>

                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: winWidth < 480 ? '16px' : '24px',
                      paddingTop: winWidth < 480 ? '16px' : '20px',
                      borderTop: '1.5px dashed #cbd5e1',
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: winWidth < 480 ? '12px' : '13px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Basic Information
                      </span>
                      {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Loading...</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: winWidth < 480 ? '1fr' : 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: winWidth < 480 ? '12px' : '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ gridColumn: winWidth < 480 ? 'span 1' : 'span 2' }}>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Employee Name</span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{details.name || emp.name || '-'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Gender</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{details.gender || '-'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Age</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{details.age || '-'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Blood Group</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{details.bloodGroup || '-'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Emergency Contact Number</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{details.emergencyContact || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}`;

  if (!content.includes(cardClosingOld)) {
    console.error('Error: cardClosingOld not found in ' + filePath);
    process.exit(1);
  }
  content = content.replace(cardClosingOld, cardClosingNew);

  if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated ' + filePath);
}

processFile(hrFile);
processFile(pmFile);
