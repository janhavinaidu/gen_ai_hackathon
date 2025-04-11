import sqlite3
import uuid
from datetime import datetime

DATABASE_NAME = 'recruitwave.db'

def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    # Create tables if they don't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        skills TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        status TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        skills TEXT NOT NULL,
        resumeId TEXT,
        status TEXT,
        matchScore REAL,
        resume_text TEXT,
        lastEvaluated TEXT
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        candidateId TEXT NOT NULL,
        url TEXT NOT NULL,
        status TEXT,
        uploadedAt TEXT NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()

# ================== CANDIDATE FUNCTIONS ==================
# In database.py, ensure you're properly committing changes
def save_candidate(candidate):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO candidates 
            (name, email, phone, skills, resumeId, status, matchScore)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        """, (candidate['name'], candidate['email'], candidate['phone'], 
              json.dumps(candidate['skills']), candidate.get('resumeId'), 
              candidate.get('status', 'New'), candidate.get('matchScore', 0)))
        result = cursor.fetchone()
        conn.commit()  # THIS IS CRUCIAL
        return dict(result) if result else None
    finally:
        conn.close()
def get_all_candidates():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM candidates')
    candidates = []
    for row in cursor.fetchall():
        candidates.append({
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'phone': row[3],
            'skills': row[4].split(','),
            'resumeId': row[5],
            'status': row[6],
            'matchScore': row[7],
            'resume_text': row[8],
            'lastEvaluated': row[9]
        })
    
    conn.close()
    return candidates

def get_candidate(candidate_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM candidates WHERE id = ?', (candidate_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'phone': row[3],
            'skills': row[4].split(','),
            'resumeId': row[5],
            'status': row[6],
            'matchScore': row[7],
            'resume_text': row[8],
            'lastEvaluated': row[9]
        }
    return None

def update_candidate(candidate_id, update_data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    set_clause = ', '.join(f"{key} = ?" for key in update_data.keys())
    values = list(update_data.values())
    values.append(candidate_id)
    
    cursor.execute(f'''
    UPDATE candidates 
    SET {set_clause}
    WHERE id = ?
    ''', values)
    
    conn.commit()
    conn.close()
    return get_candidate(candidate_id)

def delete_candidate(candidate_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM candidates WHERE id = ?', (candidate_id,))
    conn.commit()
    conn.close()

# ================== JOB FUNCTIONS ==================
def save_job(job_data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    job_id = str(uuid.uuid4())
    cursor.execute('''
    INSERT INTO jobs 
    (id, title, description, company, location, skills, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        job_id,
        job_data['title'],
        job_data['description'],
        job_data['company'],
        job_data['location'],
        ','.join(job_data['skills']),
        datetime.now().isoformat(),
        job_data.get('status', 'open')
    ))
    
    conn.commit()
    conn.close()
    return {'id': job_id, **job_data}

def get_all_jobs():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM jobs')
    jobs = []
    for row in cursor.fetchall():
        jobs.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'company': row[3],
            'location': row[4],
            'skills': row[5].split(','),
            'createdAt': row[6],
            'status': row[7]
        })
    
    conn.close()
    return jobs

def get_job(job_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'company': row[3],
            'location': row[4],
            'skills': row[5].split(','),
            'createdAt': row[6],
            'status': row[7]
        }
    return None

# ================== RESUME FUNCTIONS ==================
def save_resume(resume_data):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    resume_id = str(uuid.uuid4())
    cursor.execute('''
    INSERT INTO resumes 
    (id, candidateId, url, status, uploadedAt)
    VALUES (?, ?, ?, ?, ?)
    ''', (
        resume_id,
        resume_data['candidateId'],
        resume_data['url'],
        resume_data.get('status', 'Uploaded'),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    return {'id': resume_id, **resume_data}

def get_all_resumes():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM resumes')
    resumes = []
    for row in cursor.fetchall():
        resumes.append({
            'id': row[0],
            'candidateId': row[1],
            'url': row[2],
            'status': row[3],
            'uploadedAt': row[4]
        })
    
    conn.close()
    return resumes