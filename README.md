
# 📄 Resume Lens – AI-Powered Resume Analyzer

Resume Lens is a full-stack AI-based web application that allows users to upload their resumes (PDF/DOCX) and receive detailed feedback on their content, structure, skills, readability, and more. It's designed to help job seekers optimize their resumes for better visibility and impact.

---

## 🚀 Features

- 🔐 User authentication (JWT-based)
- 📤 Upload resumes (PDF or DOCX)
- 🧠 NLP-based resume analysis using `nltk`, `spaCy`, and `textstat`
- 📊 Skill categorization and keyword extraction
- 💡 Action word detection & achievement analysis
- 📈 Readability scoring using Flesch Reading Ease
- ✅ Recommendations for improvement
- 🗃️ Resume analysis history
- 🎨 Beautiful interactive frontend using React + TailwindCSS + Recharts

---

## 🧠 Tech Stack

### Backend
- Python 3.11
- Flask
- Flask-CORS
- SQLite
- PyJWT
- nltk, spacy, textstat, PyPDF2, python-docx

### Frontend
- React
- TailwindCSS
- Recharts
- Lucide React Icons

---

## 📂 Project Structure

```
ResumeLens/
├── backend/
│   ├── app.py             # Flask backend with API routes
│   ├── resume_analyzer.db # SQLite DB (auto-created)
│   ├── uploads/           # Temp resume uploads
│   └── requirements.txt   # Backend dependencies
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json       # Frontend dependencies
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/JxTIN21/resume-lens.git
cd resume-lens
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python app.py  # runs on http://localhost:5000
```

Make sure to create a `.env` file in `backend/` with the following content:

```env
SECRET_KEY=your-secret-key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start  # runs on http://localhost:3000
```

---

## 📈 API Endpoints

| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| POST   | `/api/register`        | Register new user              |
| POST   | `/api/login`           | Login existing user            |
| POST   | `/api/upload-resume`   | Upload and analyze a resume    |
| GET    | `/api/analyses`        | Fetch user's past analyses     |
| GET    | `/api/analysis/<id>`   | Fetch single analysis details  |

---

## 🔒 JWT Authentication

All protected routes require an `Authorization` header with a `Bearer <token>` format.

---

## 🧪 Testing

Basic manual testing:
- Upload valid `.pdf` and `.docx` files
- Try uploading invalid file types
- Test login, logout, and token expiry

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

PRs and contributions are welcome! Please open an issue first to discuss major changes.

---

## 💬 Contact

Made with ❤️ by [Jatin Srivastava](https://github.com/JxTIN21)
