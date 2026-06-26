import os
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import PyPDF2
from dotenv import load_dotenv
import google.generativeai as genai
import io
from fpdf import FPDF
import gc
import time

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
                generation_config={
                    "response_mime_type": "application/json",
                    # Deterministic settings: same resume text in -> same scores/output out.
                    # temperature=0 removes sampling randomness; seed pins the generation
                    # so repeated calls with identical input converge on the same result.
                    "temperature": 0,
                    "top_p": 1,
                    "top_k": 1,
                    "seed": 42,
                }
            )

            prompt = f"""
            You are an expert Technical Recruiter and an Honest, Realistic Career Mentor.

            CRITICAL SCORING RULES:
            1. First, identify the candidate's career stage (e.g., Student, Fresher, Mid-Level, Senior).
            2. Score the resume FAIRLY based ONLY on expectations for their specific career stage.
               Do NOT penalize a student/fresher for not having 5+ years of experience. A strong,
               well-formatted fresher resume with good projects MUST score highly (75-95). Be honest
               but realistic.
            3. Be CONSISTENT: given the same resume text, you must always return the same scores and
               the same suggestions. Do not introduce arbitrary variation between runs. Base every
               number strictly on evidence in the text, not on guesswork or randomness.
            4. Do NOT invent a precise numeric score increase for any individual suggestion (e.g. do
               not claim a single bullet rewrite adds exactly "+8 points") — that is not something you
               can honestly estimate. Instead, classify each suggestion's importance using "priority"
               (see below).

            Return ONLY a single valid JSON object (no markdown, no commentary) with EXACTLY these keys:

            - "overall_score": integer 0-100. Weighted overall ATS/recruiter score for their career stage.
            - "potential_score": integer 0-100. Realistic score they could reach if they applied ALL
               suggestions together. Must be >= overall_score (typically 5-15 points higher, never
               inflate this).
            - "format_score": integer 0-100. How clean / ATS-parseable the formatting and structure is.
            - "skills_match_score": integer 0-100. How well their listed skills match their target
               role/domain (infer the target role from the resume itself).
            - "experience_score": integer 0-100. Strength and relevance of experience/projects for
               their career stage.
            - "impact_score": integer 0-100. How well bullet points show quantified, measurable impact
               (numbers, %, scale) rather than vague duties.
            - "matched_skills": array of 3-8 short strings. Real skills/tools found in the resume that
               are valuable for their target role.
            - "missing_skills": array of 2-5 short strings. Highly valuable skills/tools for their
               target role/industry that are missing from the resume.
            - "suggestions": array of 4-6 objects, ordered by priority DESCENDING (high priority first),
               each with EXACTLY these keys:
                 - "title": short string, 3-6 words, e.g. "Quantify Experience Bullet Points"
                 - "description": one sentence, 10-25 words, plain human language, no jargon.
                 - "priority": one of "high", "medium", "low" — how much this issue is holding back
                    the resume relative to the other suggestions. "high" = biggest blocker, fix first.
                 - "type": either "rewrite" or "keywords".
                     - If "type" is "rewrite": include "current" (a short verbatim-style weak bullet
                       point pulled or closely modeled from their resume, max 20 words) and "suggested"
                       (an improved, quantified rewrite of it, max 25 words).
                     - If "type" is "keywords": include "keywords" (array of 2-4 short strings — specific
                       missing keywords/skills/methodologies relevant to their inferred target role) and
                       omit "current"/"suggested".
               Use "type": "keywords" for at least one suggestion (about missing keywords/skills), and
               "type": "rewrite" for the rest (about weak bullet points, missing metrics, formatting, etc).

            All "score" type fields must be integers, not strings. Do not include any keys other than
            the ones listed above. Do not include a numeric score_impact field anywhere.

            Resume Text:
            {extracted_text}
            """

            response = model.generate_content(prompt)
            ai_analysis = json.loads(response.text)

            # Defensive defaults in case the model omits a key
            ai_analysis.setdefault('overall_score', 0)
            ai_analysis.setdefault('potential_score', ai_analysis.get('overall_score', 0))
            ai_analysis.setdefault('format_score', 0)
            ai_analysis.setdefault('skills_match_score', 0)
            ai_analysis.setdefault('experience_score', 0)
            ai_analysis.setdefault('impact_score', 0)
            ai_analysis.setdefault('matched_skills', [])
            ai_analysis.setdefault('missing_skills', [])
            ai_analysis.setdefault('suggestions', [])

            # Strip any legacy score_impact field if an older cached/model response includes it
            for s in ai_analysis.get('suggestions', []):
                if isinstance(s, dict):
                    s.pop('score_impact', None)
                    s.setdefault('priority', 'medium')

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
                """, (
                    user_id,
                    file.filename,
                    extracted_text[:1000],
                    ai_analysis.get('overall_score'),
                    ai_analysis.get('format_score'),  # ats_score column now stores format_score
                ))
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

    return jsonify({"error": "Only PDF files are currently supported."}), 400
    
@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    # 1. Grab the uploaded file and the typed text from the frontend
    if 'file' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    file = request.files['file']
    job_title = request.form.get('job_title', 'a relevant role')
    company_name = request.form.get('company_name', 'your company')
    
    # NEW: Safely grab the optional job description from the frontend
    job_description = request.form.get('job_description', '').strip()

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

            # NEW: Check if the user provided a JD
            if job_description:
                # --- PROMPT WITH JD ---
                # Matches your style, but adds JD cross-referencing and markdown bolding
                prompt = f"""
                You are a modern career coach and a friendly, expert copywriter.
                Write an ultra-concise, highly conversational, and human-friendly cover letter for the following job.
                
                Target Job Title: {job_title}
                Target Company: {company_name}
                
                Here is the Target Job Description:
                {job_description}
                
                CRITICAL INSTRUCTIONS:
                1. Keep it extremely short (under 150 words total). 
                2. Sound like a real human. Use a warm, enthusiastic, and conversational tone. Do NOT use stiff, outdated corporate jargon.
                3. Get straight to the point. Include a very brief introduction, 2 to 3 short bullet points highlighting their absolute best metrics/projects from the resume that DIRECTLY MATCH the Job Description, and a quick wrap-up.
                4. CRITICAL HIGHLIGHTING: Whenever you mention a skill, tool, or experience in the cover letter that matches a requirement in the Job Description, you MUST wrap it in markdown bold tags (e.g., **React.js** or **Data Analysis**).
                5. Do not invent any experience the candidate does not have.
                
                Return the result as a JSON response with a single key "cover_letter" containing the formatted text. Keep the formatting clean with line breaks.

                Candidate's Resume Text:
                {extracted_text}
                """
            else:
                # --- PROMPT WITHOUT JD ---
                # This is EXACTLY the prompt you provided above
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

        # ── 1. Extract text from resume PDF ──
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

        # ── 2. Run Gemini ATS analysis ──
        try:
            active_key = get_next_api_key()
            genai.configure(api_key=active_key)

            model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"response_mime_type": "application/json"}
            )

            prompt = f"""
You are a strict, calibrated ATS (Applicant Tracking System) algorithm and expert resume analyst.

Carefully read the Resume and the Job Description below, then produce a structured analysis.

════════════════════════════════════════
HONESTY REQUIREMENT — APPLIES TO EVERY FIELD BELOW
════════════════════════════════════════
Every field you output must be grounded in the actual text of the Resume and the Job Description.
Never invent a strength, gap, keyword, quote, or question that isn't actually supported by the
text in front of you. If the resume is a weak match, say so plainly in the scores and strengths —
do not soften or inflate anything to be encouraging. If you're unsure whether a skill genuinely
counts as demonstrated, treat it as MISSING rather than giving the benefit of the doubt.

════════════════════════════════════════
SCORING CALIBRATION — WEIGHTED BY IMPORTANCE, NOT JUST A RAW COUNT
════════════════════════════════════════
Do the following as an internal step before you output anything (do not show this reasoning in
the output, only use it to arrive at the final numbers):

1. Extract every distinct skill / tool / technology / concept the Job Description actually
   requires or asks for.
2. Classify each one's importance to THIS specific role:
     - CORE        (weight 3): explicitly required, repeated, or clearly central to the role's
                                day-to-day work.
     - IMPORTANT    (weight 2): clearly relevant and expected, but not the main focus of the role.
     - NICE-TO-HAVE (weight 1): mentioned once, or framed as a "plus" / "preferred" / peripheral.
3. For each skill, decide PRESENT or MISSING based on real evidence in the resume. Equivalent
   tools/synonyms count as present (e.g. "Looker Studio" satisfies a general "BI tool"
   requirement) — you do not need an exact word match, just genuine equivalent evidence.
4. Compute:
     total_weight   = sum of the weights of every JD skill identified in step 1
     matched_weight = sum of the weights of every skill marked PRESENT in step 3
5. match_score = round(100 * matched_weight / total_weight)

This means a missing CORE skill should visibly hurt the score, while one or two missing
NICE-TO-HAVE skills should barely move it. Do NOT use a flat "X skills missing = Y score" bucket
— calculate match_score from the actual weighted ratio above, every single time, based on the
specific skills in THIS job description.

Score skills_match, experience_match, education_match, and projects_match the same way —
independently and honestly, each from only the evidence relevant to that sub-area. Do not default
any of them to 100 just because the overall match is strong, and do not deflate them either.

════════════════════════════════════════
CONTENT RULES — FOLLOW EXACTLY
════════════════════════════════════════

top_strengths — EXACTLY 5 items:
  • Each must be MAX 5–6 words, a concise skill/strength phrase
  • GOOD examples: "Strong Python and Pandas skills", "Power BI dashboard expertise",
    "Machine learning model experience", "EDA and data cleaning skills"
  • BAD examples: "Strong proficiency in core data science tools: Python (Pandas, NumPy, Scikit-learn)"
    (too long — never use colons, parentheses, or lists inside a strength)

skill_gap — EXACTLY 5 items:
  • Each must be MAX 5–6 words, a concise gap phrase
  • GOOD examples: "SQL subqueries not demonstrated", "No API integration shown",
    "Dashboard optimization skills missing", "Recommendation systems not mentioned"
  • BAD examples: "Lack of explicit mention or demonstrated expertise in SQL Subqueries" (too long)
  • Prioritise CORE/IMPORTANT missing skills over NICE-TO-HAVE ones — list the gaps that actually
    matter to this role first.

interview_questions — MINIMUM 6, up to 8 items (never fewer than 6):
  • Must be tailored to THIS specific JD's domain, industry, and required skills, AND to THIS
    resume's actual background — write the questions a real hiring manager for this exact role
    would actually ask this exact candidate.
  • Prioritise questions a candidate genuinely has a HIGH CHANCE of being asked in a real
    interview for this role/domain. Order them with the most likely/common ones first; do not pad
    the list with obscure or unrealistic edge-case questions just to hit the count.
  • Include a mix: some that probe the skill gaps you found, some that test the JD's core
    requirements, and some scenario/behavioural questions specific to this domain.
  • NOT generic — never use questions like "Tell me about yourself" or "Where do you see yourself
    in 5 years".

resume_improvements — 2 to 5 items:
  • "current": copy an actual weak or vague bullet/phrase from the resume
  • "suggested": a stronger, quantified, ATS-optimised version of the same bullet
  • Improvements must be specific, measurable, and relevant to this JD

════════════════════════════════════════
REQUIRED JSON OUTPUT
════════════════════════════════════════
Return ONLY a valid JSON object. No markdown, no extra keys, no explanations.

{{
  "match_score":         <integer 0–100, computed from the weighted formula above>,
  "skills_match":        <integer 0–100, honest independent score>,
  "experience_match":    <integer 0–100, honest independent score>,
  "education_match":     <integer 0–100, honest independent score>,
  "projects_match":      <integer 0–100, honest independent score>,

  "top_strengths":       [exactly 5 strings, each MAX 5–6 words],
  "skill_gap":           [exactly 5 strings, each MAX 5–6 words, most important gaps first],
  "matched_keywords":    [5 atomic skill strings],
  "missing_keywords":    [5 atomic skill strings],

  "interview_questions": [6 to 8 domain-specific question strings, most likely-to-be-asked first],

  "resume_improvements": [
    {{
      "current":   "<actual weak phrase/bullet from the resume>",
      "suggested": "<stronger, quantified, ATS-optimised version>"
    }}
  ],

  "recommendation": "<1 concise sentence: the single most important tip for this role>"
}}

════════════════════════════════════════
INPUT
════════════════════════════════════════
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

            finally:
                # --- RAM & RATE LIMIT FIXES ---
                # This 'finally' block always runs, ensuring memory is cleared
                # even if the try block above fails with an error!

                # Delete large strings to free up the 512MB limit
                if 'extracted_text' in locals():
                    del extracted_text
                if 'prompt' in locals():
                    del prompt
                if 'response' in locals():
                    del response

                # Empty the trash can
                gc.collect()

                # Pause for 1 second to respect Gemini API limits
                time.sleep(1)

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
        template = data.get('template', 'classic')

        # --- THE FIX: Text Cleaner ---
        # This translates fancy Word/Mac punctuation into safe standard text
        def clean_text(text):
            if not text:
                return ""
            text = str(text)
            replacements = {
                '\u2018': "'", '\u2019': "'",  # Smart single quotes/apostrophes
                '\u201c': '"', '\u201d': '"',  # Smart double quotes
                '\u2013': '-', '\u2014': '-',  # En-dash and Em-dash
                '\u2022': '-',                 # Bullets
                '\u2026': '...',               # Ellipsis
                '\u00A0': ' '                  # Non-breaking space
            }
            for search, replace in replacements.items():
                text = text.replace(search, replace)

            # This forcibly removes any other unknown characters so the server never crashes
            return text.encode('latin-1', 'ignore').decode('latin-1')

        # Initialize PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # 1. Define Template Styles dynamically based on React selection
        if template == 'modern':
            r, g, b = 15, 118, 110  # Teal accent
            font_title = 'Arial'
        elif template == 'bold':
            r, g, b = 124, 58, 237  # Violet accent
            font_title = 'Arial'
        elif template == 'minimal':
            r, g, b = 55, 65, 81    # Dark Gray
            font_title = 'Times'
        else:  # classic
            r, g, b = 30, 58, 95    # Navy accent
            font_title = 'Times'

        # 2. Build the Header (Name & Contact)
        pdf.set_font(font_title, 'B', 24)
        pdf.set_text_color(r, g, b)
        pdf.cell(0, 10, clean_text(
            data.get('fullName', 'Your Name')), ln=True, align='C')

        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(100, 100, 100)

        # Safely combine contact info
        contact_parts = [data.get('email'), data.get(
            'phone'), data.get('location'), data.get('linkedin')]
        contact_info = " | ".join([clean_text(p) for p in contact_parts if p])
        pdf.cell(0, 6, contact_info, ln=True, align='C')
        pdf.ln(5)

        # 3. Helper function to draw sections elegantly
        def add_section(title, content):
            if not content:
                return
            # Section Title
            pdf.set_font(font_title, 'B', 14)
            pdf.set_text_color(r, g, b)
            pdf.cell(0, 8, clean_text(title).upper(), ln=True)

            # Divider Line
            pdf.set_draw_color(r, g, b)
            pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
            pdf.ln(3)

            # Section Content
            pdf.set_font('Arial', '', 11)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 6, clean_text(content))
            pdf.ln(5)

        # 4. Add all sections from React
        add_section("Professional Summary", data.get('summary'))
        add_section("Experience", data.get('experience'))
        add_section("Education", data.get('education'))
        add_section("Projects", data.get('projects'))
        add_section("Skills", data.get('skills'))
        add_section("Certifications", data.get('certifications'))

        # 5. Output PDF to a temporary buffer and send to browser
        pdf_bytes = pdf.output(dest='S').encode('latin1')
        pdf_buffer = io.BytesIO(pdf_bytes)
        pdf_buffer.seek(0)

        safe_name = clean_text(
            data.get('fullName', 'Resume')).replace(' ', '_')

        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"{safe_name}_ATS_Resume.pdf",
            mimetype='application/pdf'
        )

    except Exception as e:
        print(f"PDF Error: {e}")
        return {"error": str(e)}, 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
