from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from agents import run_mistral
from database import init_db, save_candidate, get_all_candidates, get_candidate, update_candidate, delete_candidate, save_job, get_all_jobs, get_job, save_resume, get_all_resumes
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    },
    r"/jobs/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST"]
    }
})

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize database
init_db()

@app.route("/")
def home():
    return "RecruitWave AI Backend is running 🚀"

# ------------------- Job Endpoints -------------------
@app.route("/jobs/", methods=["GET", "POST"])
def jobs():
    if request.method == "GET":
        try:
            jobs = get_all_jobs()
            return jsonify(jobs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    elif request.method == "POST":
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400
        
        required_fields = ['title', 'description', 'company', 'location', 'skills']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
        
        try:
            job = {
                "title": data["title"],
                "description": data["description"],
                "company": data["company"],
                "location": data["location"],
                "skills": data["skills"],
                "status": "open",
                "createdAt": datetime.now().isoformat()
            }
            saved_job = save_job(job)
            return jsonify(saved_job), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# ------------------- Candidate Endpoints -------------------
@app.route("/candidates/", methods=["GET", "POST"])
def candidates():
    if request.method == "GET":
        try:
            candidates = get_all_candidates()
            return jsonify({
                "count": len(candidates),
                "results": candidates
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    elif request.method == "POST":
        try:
            data = request.get_json()
            if not all(key in data for key in ['name', 'email', 'skills']):
                return jsonify({"error": "Missing required fields"}), 400
                
            candidate = {
                "name": data["name"],
                "email": data["email"],
                "phone": data.get("phone", ""),
                "skills": data["skills"],
                "resumeId": data.get("resumeId", ""),
                "status": "New",
                "matchScore": data.get("matchScore", 0)
            }
            saved_candidate = save_candidate(candidate)
            return jsonify(saved_candidate), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# ------------------- Resume Endpoints -------------------
# In app.py, modify the resume endpoint
@app.route('/resumes/', methods=['POST'])
def upload_resume():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Generate secure filename
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Save to database
        resume_data = {
            'candidateId': request.form.get('candidateId'),
            'fileUrl': f'/uploads/{filename}',
            'status': 'pending'
        }
        saved_resume = save_resume(resume_data)
        
        return jsonify(saved_resume), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ------------------- Matching Endpoint -------------------
@app.route("/match/<candidate_id>/<job_id>", methods=["GET"])
def match_candidate_to_job(candidate_id, job_id):
    try:
        candidate = get_candidate(candidate_id)
        job = get_job(job_id)
        
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        prompt = f"""
Analyze the following job candidate match:

Job Title: {job['title']}
Company: {job['company']}
Required Skills: {', '.join(job['skills'])}

Candidate Skills: {', '.join(candidate['skills'])}
Resume Excerpt: {candidate.get('resume_text', '')[:1000]}...

Please provide:
1. Match percentage (0-100)
2. Top 3 matching qualifications
3. Critical missing skills
4. Hiring recommendation
"""
        
        result = run_mistral(prompt)
        
        try:
            match_score = float(result.split("Match percentage:")[1].split()[0])
            status = "Shortlisted" if match_score >= 75 else "Under Review"
        except:
            match_score = 0
            status = "Error in processing"
        
        updated_data = {
            "matchScore": match_score,
            "status": status,
            "lastEvaluated": datetime.now().isoformat()
        }
        update_candidate(candidate_id, updated_data)
        
        return jsonify({
            "candidateId": candidate_id,
            "jobId": job_id,
            "matchScore": match_score,
            "status": status,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------- Email Endpoint -------------------
@app.route("/send-email/", methods=["POST"])
def send_email():
    try:
        data = request.get_json()
        required_fields = ['to', 'subject', 'body']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        print(f"Email to be sent to {data['to']} with subject: {data['subject']}")
        
        return jsonify({
            "message": "Email queued successfully",
            "to": data['to'],
            "subject": data['subject']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------- File Serving Endpoint -------------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)