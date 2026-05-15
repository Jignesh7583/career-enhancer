import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import PyPDF2
from dotenv import load_dotenv
import google.generativeai as genai
import io
from fpdf import FPDF
from flask import send_file

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allows React to communicate with this server

# Create the uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- API KEY ROTATION LOGIC ---
# Load all keys from the .env file
API_KEYS = [
    os.getenv('GEMINI_API_KEY_1'),
    os.getenv('GEMINI_API_KEY_2'),
    os.getenv('GEMINI_API_KEY_3'),
    os.getenv('GEMINI_API_KEY_4')
]
# Filter out any keys that might be completely empty
API_KEYS = [key for key in API_KEYS if key]
current_key_index = 0


def get_next_api_key():
    """Cycles through the available API keys (Round-Robin)."""
    global current_key_index
    if not API_KEYS:
        raise Exception("No Gemini API keys found in the .env file!")

    # Get the key at the current index
    key_to_use = API_KEYS[current_key_index]

    # Move the index forward for the NEXT request.
    # If it reaches the end of the list, the % operator loops it back to 0.
    current_key_index = (current_key_index + 1) % len(API_KEYS)

    return key_to_use
# ------------------------------

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Career Enhancer Backend is running with Gemini AI!"})


@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    user_email = request.form.get('email')
    user_name = request.form.get('name', 'Unknown User')

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not user_email:
        return jsonify({"error": "User must be logged in to analyze resumes."}), 401

    if file and file.filename.endswith('.pdf'):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # 1. Extract Text using PyPDF2
        extracted_text = ""
        try:
            with open(filepath, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text
        except Exception as e:
            return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

        # 2. Analyze with Gemini 2.5 Flash
        try:
            active_key = get_next_api_key()
            genai.configure(api_key=active_key)

            model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )

            prompt = f"""
            You are an expert Technical Recruiter AND a Supportive, Empathetic Career Mentor.
            Analyze the following resume text and provide a JSON response with exactly these keys:
            - "overall_score": an integer out of 100. (Be fair and encouraging; score based on potential and structure, not just strict experience).
            - "ats_score": an integer out of 100 representing ATS compatibility and formatting.
            - "missing_skills": an array of strings (top 3 valuable missing skills based on their target tech/data role).
            - "suggestions": an array of strings (3 highly actionable, specific improvements to increase the score).

            CRITICAL TONE INSTRUCTIONS FOR SUGGESTIONS:
            - Write the "suggestions" in a warm, encouraging, and human-friendly tone. 
            - Address the user directly (e.g., "Consider updating...", "You have a great foundation in X, to make it even stronger...").
            - Instead of harsh critiques (like calling things "red flags" or "errors"), frame them as exciting opportunities to stand out to recruiters. Keep sentences concise but friendly.

            Resume Text:
            {extracted_text}
            """

            response = model.generate_content(prompt)
            ai_analysis = json.loads(response.text)

            # 3. Save Everything to the MySQL Database
            conn = get_db_connection()
            if conn:
                cursor = conn.cursor()

                # Check if user exists in database, if not, create them
                cursor.execute(
                    "SELECT id FROM Users WHERE email = %s", (user_email,))
                user_record = cursor.fetchone()

                if user_record:
                    user_id = user_record[0]
                else:
                    cursor.execute(
                        "INSERT INTO Users (name, email) VALUES (%s, %s)", (user_name, user_email))
                    conn.commit()
                    user_id = cursor.lastrowid

                # Insert the resume and AI scores into the Resumes table
                cursor.execute("""
                    INSERT INTO Resumes (user_id, file_name, parsed_text, overall_score, ats_score) 
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, file.filename, extracted_text[:1000], ai_analysis.get('overall_score'), ai_analysis.get('ats_score')))
                conn.commit()

                cursor.close()
                conn.close()

            return jsonify({
                "message": "Resume analyzed and saved to database!",
                "filename": file.filename,
                "results": ai_analysis
            })

        except Exception as e:
            return jsonify({"error": f"AI processing or Database save failed. Error: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400


@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    # 1. Grab the uploaded file and the typed text from the frontend
    if 'file' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    file = request.files['file']
    job_title = request.form.get('job_title', 'a relevant role')
    company_name = request.form.get('company_name', 'your company')

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and file.filename.endswith('.pdf'):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # 2. Extract Text from the PDF
        extracted_text = ""
        try:
            with open(filepath, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text
        except Exception as e:
            return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

        # 3. Ask Gemini 2.5 Flash to write the Cover Letter
        try:
            active_key = get_next_api_key()
            genai.configure(api_key=active_key)

            model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )

            prompt = f"""
            You are a modern career coach and a friendly, expert copywriter.
            Write an ultra-concise, highly conversational, and human-friendly cover letter for the following job.
            
            Target Job Title: {job_title}
            Target Company: {company_name}
            
            CRITICAL INSTRUCTIONS:
            1. Keep it extremely short (under 150 words total). 
            2. Sound like a real human. Use a warm, enthusiastic, and conversational tone. Do NOT use stiff, outdated corporate jargon (e.g., avoid phrases like "I am writing to express my enthusiastic interest").
            3. Get straight to the point. Include a very brief introduction, 2 to 3 short bullet points highlighting their absolute best metrics/projects from the resume, and a quick wrap-up.
            4. Do not invent any experience the candidate does not have.
            
            Return the result as a JSON response with a single key "cover_letter" containing the formatted text. Keep the formatting clean with line breaks.

            Candidate's Resume Text:
            {extracted_text}
            """

            response = model.generate_content(prompt)
            ai_analysis = json.loads(response.text)

            return jsonify({
                "message": "Cover letter generated successfully!",
                "cover_letter": ai_analysis.get('cover_letter')
            })

        except Exception as e:
            return jsonify({"error": f"AI processing failed. Error: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400


@app.route('/api/match-resume', methods=['POST'])
def match_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    file = request.files['file']
    job_description = request.form.get('job_description', '')

    if not job_description.strip():
        return jsonify({"error": "Please paste a Job Description."}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and file.filename.endswith('.pdf'):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # 1. Extract Text from Resume
        extracted_text = ""
        try:
            with open(filepath, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text
        except Exception as e:
            return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

        # 2. Ask Gemini to Compare the Resume vs. the JD
        try:
            active_key = get_next_api_key()
            genai.configure(api_key=active_key)

            # Using 2.5-flash-latest to avoid the rate limits we hit earlier!
            model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )

            prompt = f"""
            You are a strict ATS (Applicant Tracking System) algorithm.
            Compare the provided Resume against the provided Job Description.
            
            Return the result as a JSON response with exactly these keys:
            - "match_score": an integer out of 100 representing how well the resume matches the JD.
            - "matched_keywords": an array of strings (top 5 important skills/keywords present in BOTH).
            - "missing_keywords": an array of strings (top 5 critical skills/keywords present in the JD but MISSING from the resume).
            - "recommendation": A short, friendly 1-sentence tip on how to improve their chances for this specific role.

            Job Description:
            {job_description}

            Candidate's Resume:
            {extracted_text}
            """

            response = model.generate_content(prompt)
            ai_analysis = json.loads(response.text)

            return jsonify({
                "message": "Match analysis complete!",
                "results": ai_analysis
            })

        except Exception as e:
            return jsonify({"error": f"AI processing failed. Error: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400


@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    # 1. Look at who is asking for data (we will send the email from React)
    user_email = request.args.get('email')

    if not user_email:
        return jsonify({"error": "No email provided"}), 400

    try:
        conn = get_db_connection()
        if conn:
            # This makes the results format neatly
            cursor = conn.cursor(dictionary=True)

            # 2. Find the user ID based on their email
            cursor.execute(
                "SELECT id, name FROM Users WHERE email = %s", (user_email,))
            user = cursor.fetchone()

            if not user:
                # If they are a brand new user who hasn't uploaded anything yet
                return jsonify({"message": "New user", "has_data": False})

            # 3. Grab their most recent resume analysis from the database
            cursor.execute("""
                SELECT file_name, overall_score, ats_score, uploaded_at 
                FROM Resumes 
                WHERE user_id = %s 
                ORDER BY uploaded_at DESC 
                LIMIT 1
            """, (user['id'],))

            latest_resume = cursor.fetchone()

            cursor.close()
            conn.close()

            # 4. Send the data back to the frontend!
            if latest_resume:
                return jsonify({
                    "has_data": True,
                    "user_name": user['name'],
                    "latest_score": latest_resume['overall_score'],
                    "ats_score": latest_resume['ats_score'],
                    "file_name": latest_resume['file_name']
                })
            else:
                return jsonify({"has_data": False})

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/api/chat', methods=['POST'])
def chat_assistant():
    # 1. Get the data sent from React
    data = request.json
    user_message = data.get('message')
    user_email = data.get('email')

    if not user_message or not user_email:
        return jsonify({"error": "Message and email are required."}), 400

    # 2. Grab the user's latest resume from the database to give the AI context
    resume_context = ""
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id FROM Users WHERE email = %s", (user_email,))
            user = cursor.fetchone()

            if user:
                # Get their latest resume text
                cursor.execute("""
                    SELECT parsed_text FROM Resumes 
                    WHERE user_id = %s 
                    ORDER BY uploaded_at DESC LIMIT 1
                """, (user['id'],))
                resume = cursor.fetchone()
                if resume and resume['parsed_text']:
                    resume_context = resume['parsed_text']

            cursor.close()
            conn.close()
    except Exception as e:
        print("Database error in chat:", e)
        # We don't stop the chat if the DB fails, the AI just won't have resume context.

    # 3. Ask Gemini to reply
    try:
        active_key = get_next_api_key()
        genai.configure(api_key=active_key)

        # We use 2.5-flash-latest for chatting so we don't hit the speed limits!
        model = genai.GenerativeModel('gemini-2.5-flash')

        # We give the AI a strict persona and feed it your resume!
        system_prompt = f"""
        You are an expert, friendly AI Career Coach. 
        Keep your answers short, conversational, and highly actionable. Don't write long essays.
        
        Here is the user's current resume text for context (if available):
        {resume_context if resume_context else "No resume uploaded yet."}
        
        The user asks: {user_message}
        """

        response = model.generate_content(system_prompt)

        return jsonify({
            "reply": response.text
        })

    except Exception as e:
        print(f"🛑 THE REAL ERROR IS: {str(e)}")
        return jsonify({"error": f"AI processing failed. Error: {str(e)}"}), 500


@app.route('/api/bulk-screen', methods=['POST'])
def bulk_screen():
    # 1. Get the Job Description and the LIST of files
    job_description = request.form.get('job_description', '')

    # Notice we use 'getlist' here instead of just 'get'.
    # This tells Flask to expect multiple files instead of just one!
    files = request.files.getlist('files')

    if not job_description.strip():
        return jsonify({"error": "Job description is required."}), 400
    if not files or len(files) == 0:
        return jsonify({"error": "No resumes uploaded."}), 400

    # We create an empty list. We will store each candidate's score in here.
    leaderboard = []

    # 2. Start a "Loop" to process each resume one by one
    for file in files:
        if file and file.filename.endswith('.pdf'):

            # Extract text from the current PDF
            extracted_text = ""
            try:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text
            except Exception as e:
                print(f"Could not read {file.filename}, skipping.")
                continue  # If one PDF is corrupted, skip it and move to the next

            # Ask Gemini to score this specific resume
            try:
                # Your clever API key rotation will switch keys for every resume in the loop!
                active_key = get_next_api_key()
                genai.configure(api_key=active_key)

                model = genai.GenerativeModel(
                    'gemini-2.5-flash',
                    generation_config={
                        "response_mime_type": "application/json"}
                )

                prompt = f"""
                You are an expert ATS algorithm. Score this candidate against the Job Description.
                Return ONLY a JSON response with these exact keys:
                - "candidate_name": A string (Extract their name from the resume. If missing, put "Unknown").
                - "match_score": An integer out of 100.
                - "key_strength": A short 1-sentence summary of why they are a good fit.
                
                Job Description: {job_description}
                
                Resume Text: {extracted_text}
                """

                response = model.generate_content(prompt)
                ai_result = json.loads(response.text)

                # We attach the original filename so we know which file belongs to which score
                ai_result['filename'] = file.filename

                # Add this candidate's score to our leaderboard list
                leaderboard.append(ai_result)

            except Exception as e:
                print(f"🛑 AI failed for {file.filename}. Error: {str(e)}")

    # 3. Sort the leaderboard so the highest score is at the top (1st place)
    # The 'lambda' function simply tells Python: "Sort this list based on the match_score number"
    leaderboard.sort(key=lambda x: x.get('match_score', 0), reverse=True)

    # 4. Send the final, ranked list back to React!
    return jsonify({
        "message": "Bulk screening complete!",
        "leaderboard": leaderboard
    })


@app.route('/api/learning-path', methods=['POST'])
def generate_learning_path():
    # 1. Get the topic the user typed in React
    data = request.json
    topic = data.get('topic')

    if not topic:
        return jsonify({"error": "Please provide a topic to learn."}), 400

    # 2. Ask Gemini to build a custom study plan
    try:
        active_key = get_next_api_key()
        genai.configure(api_key=active_key)

        model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config={"response_mime_type": "application/json"}
        )
        prompt = f"""
        You are a senior tech mentor. Create a comprehensive, 5-step learning roadmap for: {topic}.
        Also, recommend 3 highly-rated online courses or resources where the user can learn this.
        
        Return ONLY a JSON response with this exact structure:
        {{
            "roadmap": [
                {{
                    "step": 1,
                    "title": "Beginner concept title",
                    "description": "Detailed explanation of what to learn in this step.",
                    "practice_project": "A specific beginner project."
                }},
                // ... continue this up to step 5 (Advanced)
            ],
            "courses": [
                {{
                    "title": "Exact name of the course or tutorial",
                    "platform": "Platform name (e.g., YouTube, Coursera, Udemy)",
                    "price": "Free or Paid"
                }}
            ]
        }}
        """

        response = model.generate_content(prompt)
        ai_roadmap = json.loads(response.text)

        return jsonify({
            "message": "Roadmap generated!",
            "topic": topic,
            "roadmap": ai_roadmap.get('roadmap', [])
        })

    except Exception as e:
        print(f"🛑 THE REAL ERROR IS: {str(e)}")
        return jsonify({"error": "AI failed to generate the roadmap."}), 500


@app.route('/api/insights', methods=['GET'])
def get_insights():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = conn.cursor(dictionary=True)

        # 1. Get Total Resumes Analyzed
        cursor.execute("SELECT COUNT(*) as total FROM Resumes")
        total_resumes = cursor.fetchone()['total']

        # 2. Get Average ATS & Overall Scores
        cursor.execute(
            "SELECT AVG(ats_score) as avg_ats, AVG(overall_score) as avg_overall FROM Resumes")
        averages = cursor.fetchone()
        avg_ats = round(averages['avg_ats'] or 0, 1)
        avg_overall = round(averages['avg_overall'] or 0, 1)

        cursor.close()
        conn.close()

        # 3. Package the DB data along with simulated market trends for the UI
        return jsonify({
            "success": True,
            "platform_stats": {
                "total_analyzed": total_resumes,
                "average_ats": avg_ats,
                "average_overall": avg_overall
            },
            "top_missing_skills": [
                {"skill": "Power BI", "gap_percentage": 78, "color": "bg-blue-500"},
                {"skill": "AWS / Cloud", "gap_percentage": 64,
                    "color": "bg-purple-500"},
                {"skill": "Docker / Kubernetes",
                    "gap_percentage": 45, "color": "bg-indigo-500"},
                {"skill": "Machine Learning",
                    "gap_percentage": 32, "color": "bg-cyan-500"}
            ],
            "hiring_trends": [
                {"role": "Data Analyst", "growth": 40},
                {"role": "AI/Prompt Engineer", "growth": 85},
                {"role": "Full Stack Developer", "growth": 22}
            ]
        })

    except Exception as e:
        print(f"🛑 Insights DB Error: {str(e)}")
        return jsonify({"error": "Failed to fetch analytics."}), 500


@app.route('/api/generate-resume-pdf', methods=['POST'])
def generate_resume_pdf():
    try:
        data = request.json

        # 1. Initialize the PDF document
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # 2. Add Name (Header)
        pdf.set_font("Arial", 'B', 24)
        pdf.cell(0, 10, data.get('fullName', 'Your Name'), ln=True, align='C')

        # 3. Add Contact Info
        pdf.set_font("Arial", '', 11)
        contact_info = f"{data.get('email', '')}  |  {data.get('phone', '')}"
        pdf.cell(0, 10, contact_info, ln=True, align='C')
        pdf.ln(5)  # Add a small line break

        # 4. Add Summary
        if data.get('summary'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, "Professional Summary", ln=True)
            # Draw a separator line
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(3)
            pdf.set_font("Arial", '', 11)
            pdf.multi_cell(0, 7, data.get('summary', ''))
            pdf.ln(5)

        # 5. Add Experience
        if data.get('experience'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, "Experience", ln=True)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(3)
            pdf.set_font("Arial", '', 11)
            pdf.multi_cell(0, 7, data.get('experience', ''))
            pdf.ln(5)

        # 6. Add Skills
        if data.get('skills'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, "Core Skills", ln=True)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(3)
            pdf.set_font("Arial", '', 11)
            pdf.multi_cell(0, 7, data.get('skills', ''))

        # 7. Convert PDF to a byte stream to send to the frontend
        # output(dest='S') returns the PDF as a string (latin-1 encoded), which we convert to bytes
        pdf_bytes = pdf.output(dest='S').encode('latin-1')
        buffer = io.BytesIO(pdf_bytes)
        buffer.seek(0)

        # 8. Send the file to the user for download!
        return send_file(
            buffer,
            as_attachment=True,
            download_name="My_ATS_Resume.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        print(f"🛑 PDF Generation Error: {str(e)}")
        return jsonify({"error": "Failed to generate PDF."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
