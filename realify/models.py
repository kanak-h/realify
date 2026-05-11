from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class DetectionResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    prediction = db.Column(db.String(20), nullable=False) # 'Real' or 'Fake'
    confidence = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'prediction': self.prediction,
            'confidence': self.confidence,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }
