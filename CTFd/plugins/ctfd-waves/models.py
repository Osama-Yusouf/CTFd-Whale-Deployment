from CTFd.models import db

class Wave(db.Model):
    __tablename__ = "waves"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    release_time = db.Column(db.DateTime, nullable=False)
    released = db.Column(db.Boolean, default=False)
    
    def __init__(self, name, release_time):
        self.name = name
        self.release_time = release_time

class WaveChallenge(db.Model):
    __tablename__ = "wave_challenges"
    id = db.Column(db.Integer, primary_key=True)
    wave_id = db.Column(db.Integer, db.ForeignKey("waves.id", ondelete="CASCADE"))
    challenge_id = db.Column(db.Integer, db.ForeignKey("challenges.id", ondelete="CASCADE"))
    
    def __init__(self, wave_id, challenge_id):
        self.wave_id = wave_id
        self.challenge_id = challenge_id
