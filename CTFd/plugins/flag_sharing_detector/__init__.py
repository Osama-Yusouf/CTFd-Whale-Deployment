import datetime
from flask import Blueprint, render_template
from CTFd.utils.decorators import admins_only
from CTFd.models import db, Submissions, Users, Challenges
from sqlalchemy import event
from sqlalchemy.orm import Session

# Create a permanent history table to catch cheats after container destruction
class WhaleFlagHistory(db.Model):
    __tablename__ = 'whale_flag_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    challenge_id = db.Column(db.Integer)
    flag = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

@event.listens_for(Session, 'before_flush')
def record_flag_history(session, flush_context, instances):
    new_histories = []
    for obj in session.new:
        if obj.__class__.__name__ == 'WhaleContainer':
            history = WhaleFlagHistory(
                user_id=obj.user_id,
                flag=obj.flag,
                challenge_id=obj.challenge_id
            )
            new_histories.append(history)
    for h in new_histories:
        session.add(h)

def load(app):
    # Ensure permanent history table exists
    with app.app_context():
        WhaleFlagHistory.__table__.create(db.engine, checkfirst=True)

    # Setup Blueprint
    cheat_bp = Blueprint('cheat_detection', __name__, template_folder='templates')

    @cheat_bp.route('/admin/cheat-detection', methods=['GET'])
    @admins_only
    def cheat_detection():
        from CTFd.models import Teams
        from sqlalchemy import func

        Cheater = db.aliased(Users, name="cheater")
        Victim = db.aliased(Users, name="victim")
        CheaterTeam = db.aliased(Teams, name="cheater_team")
        VictimTeam = db.aliased(Teams, name="victim_team")

        cheats = db.session.query(
            func.coalesce(Cheater.team_id, Cheater.id).label('cheater_id'),
            func.coalesce(CheaterTeam.name, Cheater.name).label('cheater_name'),
            func.coalesce(Victim.team_id, Victim.id).label('victim_id'),
            func.coalesce(VictimTeam.name, Victim.name).label('victim_name'),
            Submissions.provided.label('flag'),
            Submissions.date.label('date'),
            Challenges.name.label('challenge_name')
        ).join(
            WhaleFlagHistory, Submissions.provided == WhaleFlagHistory.flag
        ).join(
            Cheater, Submissions.user_id == Cheater.id
        ).join(
            Victim, WhaleFlagHistory.user_id == Victim.id
        ).join(
            Challenges, Submissions.challenge_id == Challenges.id
        ).outerjoin(
            CheaterTeam, Cheater.team_id == CheaterTeam.id
        ).outerjoin(
            VictimTeam, Victim.team_id == VictimTeam.id
        ).filter(
            Submissions.type == 'incorrect',
            Submissions.user_id != WhaleFlagHistory.user_id,
            db.or_(Cheater.team_id == None, Victim.team_id == None, Cheater.team_id != Victim.team_id)
        ).order_by(Submissions.date.desc()).all()

        return render_template('cheat_detection.html', cheats=cheats)

    app.register_blueprint(cheat_bp)
