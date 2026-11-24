import { supabase } from './supabaseClient.js'

let editingStudentId = null

// AUTH
document.getElementById('signInBtn').onclick = async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  document.getElementById('authMsg').innerText = error ? error.message : 'Signed in!'
  if (!error) {
    document.getElementById('signedInAs').innerText = `Signed in as ${email}`
    loadStudents()
  }
}

document.getElementById('registerBtn').onclick = async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const { error } = await supabase.auth.signUp({ email, password })
  document.getElementById('authMsg').innerText = error ? error.message : 'Registered! Now click Sign in.'
}

document.getElementById('signOutBtn').onclick = async () => {
  await supabase.auth.signOut()
  document.getElementById('authMsg').innerText = 'Signed out'
  document.getElementById('signedInAs').innerText = 'Not signed in'
}

// SAVE STUDENT
document.getElementById('saveBtn').onclick = async () => {
  const data = {
    student_id: document.getElementById('studentId').value,
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    course: document.getElementById('course').value,
    year_level: 1,
    email: `${document.getElementById('firstName').value}.${document.getElementById('lastName').value}.${document.getElementById('studentId').value}@student.com`.toLowerCase(),
  }
  let result
  if (editingStudentId) {
    result = await supabase.from('students').update(data).eq('student_id', editingStudentId)
  } else {
    result = await supabase.from('students').insert([data])
  }
  document.getElementById('saveMsg').innerText = result.error ? result.error.message : 'Saved!'
  editingStudentId = null
  loadStudents()
}

// LOAD STUDENTS - FIXED: use student_id, not id
async function loadStudents(search = '') {
  let query = supabase.from('students').select('*').order('student_id', { ascending: true })
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
  }
  const { data, error } = await query
  if (error) {
    document.getElementById('studentList').innerText = error.message
    return
  }
  const list = document.getElementById('studentList')
  list.innerHTML = ''
  data.forEach(s => {
    const div = document.createElement('div')
    div.innerHTML = `${s.first_name} ${s.last_name} — ${s.student_id} — ${s.course}
      <button onclick="editStudent('${s.student_id}', '${s.first_name}', '${s.last_name}', '${s.course}')">Edit</button>
      <button onclick="deleteStudent('${s.student_id}')">Delete</button>`
    list.appendChild(div)
  })
}

window.editStudent = (sid, fn, ln, course) => {
  editingStudentId = sid
  document.getElementById('studentId').value = sid
  document.getElementById('firstName').value = fn
  document.getElementById('lastName').value = ln
  document.getElementById('course').value = course
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

window.deleteStudent = async (sid) => {
  if (!confirm('Delete this student?')) return
  await supabase.from('students').delete().eq('student_id', sid)
  loadStudents()
}

document.getElementById('searchBtn').onclick = () => {
  loadStudents(document.getElementById('searchInput').value)
}
document.getElementById('loadAllBtn').onclick = () => loadStudents()
document.getElementById('clearBtn').onclick = () => {
  editingStudentId = null
  document.getElementById('studentId').value = ''
  document.getElementById('firstName').value = ''
  document.getElementById('lastName').value = ''
  document.getElementById('course').value = ''
}

// COURSE REPORT
document.getElementById('countBtn').onclick = async () => {
  const course = document.getElementById('courseReportInput').value
  const { data, error } = await supabase.from('students').select('student_id').eq('course', course)
  document.getElementById('countResult').innerText = error ? error.message : `Students in ${course}: ${data.length}`
}

loadStudents()