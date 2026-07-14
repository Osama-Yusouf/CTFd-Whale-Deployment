import threading
import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from CTFd.models import db, Challenges
from CTFd.cache import cache
from CTFd.utils.decorators import admins_only
from .models import Wave, WaveChallenge

def release_scheduler(app):
    with app.app_context():
        while True:
            try:
                # We must clear the session to prevent stale reads in MySQL REPEATABLE READ isolation
                db.session.commit()
                
                now = datetime.utcnow()
                # Find waves that are scheduled to be released but haven't been yet
                pending_waves = Wave.query.filter(Wave.release_time <= now, Wave.released == False).all()
                for wave in pending_waves:
                    print(f"[ctfd-waves] Releasing wave: {wave.name}")
                    # Get all challenges mapped to this wave
                    wave_chals = WaveChallenge.query.filter_by(wave_id=wave.id).all()
                    chal_ids = [wc.challenge_id for wc in wave_chals]
                    if chal_ids:
                        Challenges.query.filter(Challenges.id.in_(chal_ids)).update({"state": "visible"}, synchronize_session=False)
                    wave.released = True
                
                if pending_waves:
                    db.session.commit()
                    # Clear the CTFd cache so the public api updates with the new visible challenges
                    cache.clear()
            except Exception as e:
                print(f"[ctfd-waves] Error in release scheduler: {e}")
                db.session.rollback()
            time.sleep(10)

def load(app):
    app.db.create_all()

    waves_bp = Blueprint('waves', __name__, template_folder='templates')

    @waves_bp.route('/api/v1/waves', methods=['GET'])
    @admins_only
    def list_waves():
        waves = Wave.query.all()
        result = []
        for w in waves:
            chals = WaveChallenge.query.filter_by(wave_id=w.id).all()
            result.append({
                "id": w.id,
                "name": w.name,
                "release_time": w.release_time.isoformat(),
                "released": w.released,
                "challenges": [c.challenge_id for c in chals]
            })
        return jsonify({"success": True, "data": result})

    @waves_bp.route('/api/v1/waves', methods=['POST'])
    @admins_only
    def create_wave():
        req = request.get_json()
        name = req.get('name')
        release_time = req.get('release_time')
        try:
            dt = datetime.fromisoformat(release_time.replace("Z", "+00:00"))
            # convert to naive UTC datetime
            dt = dt.replace(tzinfo=None)
        except:
            return jsonify({"success": False, "message": "Invalid date format"}), 400
            
        wave = Wave(name=name, release_time=dt)
        db.session.add(wave)
        db.session.commit()
        return jsonify({"success": True, "data": {"id": wave.id}})

    @waves_bp.route('/api/v1/waves/<int:wave_id>', methods=['DELETE'])
    @admins_only
    def delete_wave(wave_id):
        Wave.query.filter_by(id=wave_id).delete()
        db.session.commit()
        return jsonify({"success": True})

    @waves_bp.route('/api/v1/waves/<int:wave_id>/challenges', methods=['POST'])
    @admins_only
    def assign_challenges(wave_id):
        req = request.get_json()
        challenge_ids = req.get('challenge_ids', [])
        
        # Clear existing assignments for these challenges
        WaveChallenge.query.filter(WaveChallenge.challenge_id.in_(challenge_ids)).delete(synchronize_session=False)
        
        # Add new assignments
        for cid in challenge_ids:
            wc = WaveChallenge(wave_id=wave_id, challenge_id=cid)
            db.session.add(wc)
            
        db.session.commit()
        return jsonify({"success": True})

    app.register_blueprint(waves_bp)

    # Start the background release scheduler
    thread = threading.Thread(target=release_scheduler, args=(app,), daemon=True)
    thread.start()
