from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import json
import re
import sqlite3
from datetime import datetime, timedelta
import jwt
from functools import wraps
import PyPDF2
import docx
import nltk
from collections import Counter
import secrets
import spacy
from textstat import flesch_reading_ease
from dotenv import load_dotenv

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-key')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

CORS(app, supports_credentials=True)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database initialization
def init_db():
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            analysis_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Resume text extraction functions
def extract_text_from_pdf(file_path):
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def extract_text_from_docx(file_path):
    text = ""
    try:
        doc = docx.Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
    return text

# Resume analysis functions
class ResumeAnalyzer:
    def __init__(self):
        # Technical skills database
        self.technical_skills = {
            'programming_languages': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
                'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'bash', 'powershell'
            ],
            'frameworks': [
                'react', 'angular', 'vue', 'django', 'flask', 'express', 'spring', 'laravel',
                'rails', 'asp.net', 'bootstrap', 'tailwind', 'jquery', 'node.js', 'next.js'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
                'cassandra', 'dynamodb', 'firebase'
            ],
            'cloud_tools': [
                'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
                'gitlab', 'terraform', 'ansible', 'nginx', 'apache'
            ],
            'data_science': [
                'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
                'matplotlib', 'seaborn', 'tableau', 'power bi', 'jupyter', 'spark'
            ]
        }
        
        # Required sections
        self.required_sections = [
            'summary', 'objective', 'experience', 'education', 'skills', 'projects'
        ]
        
        # Action words for experience analysis
        self.action_words = [
            'managed', 'led', 'developed', 'created', 'implemented', 'designed', 'built',
            'optimized', 'improved', 'increased', 'reduced', 'achieved', 'delivered',
            'coordinated', 'supervised', 'analyzed', 'collaborated', 'established'
        ]
    
    def analyze_resume(self, text):
        text_lower = text.lower()
        
        # Extract skills
        skills_found = self.extract_skills(text_lower)
        
        # Check for missing sections
        missing_sections = self.check_missing_sections(text_lower)
        
        # Analyze experience quality
        experience_analysis = self.analyze_experience(text_lower)
        
        # Calculate readability
        readability_score = flesch_reading_ease(text)
        
        # Word frequency analysis
        word_freq = self.get_word_frequency(text_lower)
        
        # Calculate overall score
        overall_score = self.calculate_overall_score(
            skills_found, missing_sections, experience_analysis, readability_score
        )
        
        return {
            'skills': skills_found,
            'missing_sections': missing_sections,
            'experience_analysis': experience_analysis,
            'readability_score': readability_score,
            'word_frequency': word_freq,
            'overall_score': overall_score,
            'recommendations': self.generate_recommendations(
                skills_found, missing_sections, experience_analysis
            )
        }
    
    def extract_skills(self, text):
        skills_found = {}
        total_skills = 0
        
        for category, skills_list in self.technical_skills.items():
            found_skills = []
            for skill in skills_list:
                if skill in text:
                    found_skills.append(skill)
                    total_skills += 1
            skills_found[category] = found_skills
        
        skills_found['total_count'] = total_skills
        return skills_found
    
    def check_missing_sections(self, text):
        missing = []
        section_patterns = {
            'summary': ['summary', 'profile', 'about'],
            'objective': ['objective', 'career objective'],
            'experience': ['experience', 'work experience', 'employment', 'professional experience'],
            'education': ['education', 'academic', 'degree', 'university', 'college'],
            'skills': ['skills', 'technical skills', 'competencies'],
            'projects': ['projects', 'portfolio', 'work samples']
        }
        
        for section, patterns in section_patterns.items():
            found = any(pattern in text for pattern in patterns)
            if not found:
                missing.append(section)
        
        return missing
    
    def analyze_experience(self, text):
        action_words_found = []
        for word in self.action_words:
            if word in text:
                action_words_found.append(word)
        
        # Count quantifiable achievements (numbers/percentages)
        numbers = re.findall(r'\d+(?:\.\d+)?%?', text)
        
        return {
            'action_words': action_words_found,
            'action_words_count': len(action_words_found),
            'quantifiable_achievements': len(numbers),
            'numbers_found': numbers[:10]  # First 10 numbers found
        }
    
    def get_word_frequency(self, text):
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize
        
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(text)
        words = [word for word in words if word.isalpha() and word not in stop_words and len(word) > 2]
        
        word_freq = Counter(words)
        return dict(word_freq.most_common(20))
    
    def calculate_overall_score(self, skills, missing_sections, experience, readability):
        score = 0
        
        # Skills score (30%)
        skills_score = min(skills['total_count'] * 2, 30)
        score += skills_score
        
        # Sections completeness (25%)
        sections_score = max(0, 25 - len(missing_sections) * 5)
        score += sections_score
        
        # Experience quality (25%)
        exp_score = min(experience['action_words_count'] * 2 + experience['quantifiable_achievements'], 25)
        score += exp_score
        
        # Readability (20%)
        if readability >= 60:
            read_score = 20
        elif readability >= 30:
            read_score = 15
        else:
            read_score = 10
        score += read_score
        
        return min(score, 100)
    
    def generate_recommendations(self, skills, missing_sections, experience):
        recommendations = []
        
        if skills['total_count'] < 10:
            recommendations.append("Add more technical skills to improve your profile visibility.")
        
        if missing_sections:
            recommendations.append(f"Consider adding these missing sections: {', '.join(missing_sections)}")
        
        if experience['action_words_count'] < 5:
            recommendations.append("Use more action words to describe your achievements.")
        
        if experience['quantifiable_achievements'] < 3:
            recommendations.append("Include more quantifiable achievements with numbers and percentages.")
        
        return recommendations

# Initialize analyzer
analyzer = ResumeAnalyzer()

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'All fields are required'}), 400
    
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'message': 'User already exists'}), 400
    
    # Create user
    password_hash = generate_password_hash(password)
    cursor.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                   (username, email, password_hash))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    # Generate token
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': {'id': user_id, 'username': username, 'email': email}
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not all([username, password]):
        return jsonify({'message': 'Username and password are required'}), 400
    
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
                   (username, username))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not check_password_hash(user[3], password):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user[0],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user[0], 'username': user[1], 'email': user[2]}
    })

@app.route('/api/upload-resume', methods=['POST'])
@token_required
def upload_resume(current_user_id):
    if 'resume' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        return jsonify({'message': 'Only PDF and DOCX files are allowed'}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Extract text
    if filename.lower().endswith('.pdf'):
        text = extract_text_from_pdf(filepath)
    else:
        text = extract_text_from_docx(filepath)
    
    if not text.strip():
        os.remove(filepath)
        return jsonify({'message': 'Could not extract text from file'}), 400
    
    # Analyze resume
    analysis = analyzer.analyze_resume(text)
    
    # Save analysis to database
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO resume_analyses (user_id, filename, analysis_data) VALUES (?, ?, ?)',
                   (current_user_id, filename, json.dumps(analysis)))
    conn.commit()
    analysis_id = cursor.lastrowid
    conn.close()
    
    # Clean up file
    os.remove(filepath)
    
    return jsonify({
        'message': 'Resume analyzed successfully',
        'analysis_id': analysis_id,
        'analysis': analysis
    })

@app.route('/api/analyses', methods=['GET'])
@token_required
def get_analyses(current_user_id):
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, filename, analysis_data, created_at 
        FROM resume_analyses 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (current_user_id,))
    
    analyses = []
    for row in cursor.fetchall():
        analyses.append({
            'id': row[0],
            'filename': row[1],
            'analysis': json.loads(row[2]),
            'created_at': row[3]
        })
    
    conn.close()
    return jsonify(analyses)

@app.route('/api/analysis/<int:analysis_id>', methods=['GET'])
@token_required
def get_analysis(current_user_id, analysis_id):
    conn = sqlite3.connect('resume_analyzer.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT filename, analysis_data, created_at 
        FROM resume_analyses 
        WHERE id = ? AND user_id = ?
    ''', (analysis_id, current_user_id))
    
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        return jsonify({'message': 'Analysis not found'}), 404
    
    return jsonify({
        'filename': result[0],
        'analysis': json.loads(result[1]),
        'created_at': result[2]
    })

if __name__ == '__main__':
    import os
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)