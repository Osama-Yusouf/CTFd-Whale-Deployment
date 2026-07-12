from flask import Blueprint, render_template
from CTFd.utils.decorators import admins_only
from CTFd.models import db, Submissions, Users, Challenges

# Create a lightweight mapping to the whale_container table
class WhaleContainerMap(db.Model):
    __tablename__ = 'whale_container'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    flag = db.Column(db.String(128))

def load(app):
    # Setup Blueprint
    cheat_bp = Blueprint('cheat_detection', __name__, template_folder='templates')

    @cheat_bp.route('/admin/cheat-detection', methods=['GET'])
    @admins_only
    def cheat_detection():
        Cheater = db.aliased(Users, name="cheater")
        Victim = db.aliased(Users, name="victim")

        cheats = db.session.query(
            Cheater.id.label('cheater_id'),
            Cheater.name.label('cheater_name'),
            Victim.id.label('victim_id'),
            Victim.name.label('victim_name'),
            Submissions.provided.label('flag'),
            Submissions.date.label('date'),
            Challenges.name.label('challenge_name')
        ).join(
            WhaleContainerMap, Submissions.provided == WhaleContainerMap.flag
        ).join(
            Cheater, Submissions.user_id == Cheater.id
        ).join(
            Victim, WhaleContainerMap.user_id == Victim.id
        ).join(
            Challenges, Submissions.challenge_id == Challenges.id
        ).filter(
            Submissions.type == 'incorrect',
            Submissions.user_id != WhaleContainerMap.user_id,
            db.or_(Cheater.team_id == None, Victim.team_id == None, Cheater.team_id != Victim.team_id)
        ).all()

        return render_template('cheat_detection.html', cheats=cheats)

    app.register_blueprint(cheat_bp)
