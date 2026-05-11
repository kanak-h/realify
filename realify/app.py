import os
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
from models import db, DetectionResult
from ai_engine import AIEngine

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev_key_123')

# Configuration
# Use absolute path for DB to avoid issues in production
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'realify.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Ensure upload and instance directories exist
for folder in [app.config['UPLOAD_FOLDER'], os.path.join(basedir, 'instance')]:
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)
        print(f"Created directory: {folder}")

# Initialize Database
db.init_app(app)
try:
    with app.app_context():
        db.create_all()
except Exception as e:
    print(f"Error creating database: {e}")

# Error handler for 500
@app.errorhandler(500)
def server_error(e):
    return jsonify(error="Internal Server Error", message=str(e)), 500

# Initialize AI Engine
ai_engine = AIEngine()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Run AI Prediction
            result = ai_engine.predict(file_path)

            # Save to Database
            new_result = DetectionResult(
                filename=filename,
                file_type=file.content_type,
                prediction=result['prediction'],
                confidence=result['confidence']
            )
            db.session.add(new_result)
            db.session.commit()

            return jsonify({
                'success': True,
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'id': new_result.id
            })
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history')
def get_history():
    results = DetectionResult.query.order_by(DetectionResult.timestamp.desc()).limit(10).all()
    return jsonify([r.to_dict() for r in results])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
