import datetime
import random
import string
from flask import Blueprint, render_template, request, redirect, url_for, flash
from CTFd.utils.decorators import admins_only
from CTFd.models import db

class SingleUseToken(db.Model):
    __tablename__ = 'single_use_tokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(32), unique=True)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

def generate_random_token():
    return 'TEAM-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def load(app):
    with app.app_context():
        SingleUseToken.__table__.create(db.engine, checkfirst=True)

    tokens_bp = Blueprint('single_use_tokens', __name__, template_folder='templates')

    @tokens_bp.route('/admin/tokens', methods=['GET', 'POST'])
    @admins_only
    def manage_tokens():
        if request.method == 'POST':
            # Generate a batch of tokens or just one
            count = int(request.form.get('count', 1))
            for _ in range(count):
                new_token = SingleUseToken(token=generate_random_token())
                db.session.add(new_token)
            db.session.commit()
            flash(f'Generated {count} new token(s).', 'success')
            return redirect(url_for('single_use_tokens.manage_tokens'))

        tokens = SingleUseToken.query.order_by(SingleUseToken.created_at.desc()).all()
        return render_template('tokens.html', tokens=tokens)

    app.register_blueprint(tokens_bp)

    # Hijack the registration route
    original_register = app.view_functions.get('auth.register')
    
    if original_register:
        def custom_register(*args, **kwargs):
            if request.method == 'POST':
                provided_token = request.form.get('registration_token', '').strip()
                
                if not provided_token:
                    flash("Registration Token is required.", "error")
                    return redirect(url_for('auth.register'))

                token_record = SingleUseToken.query.filter_by(token=provided_token, used=False).first()
                
                if not token_record:
                    flash("Invalid or already used Registration Token.", "error")
                    return redirect(url_for('auth.register'))
                
                # Valid token! Mark as used
                token_record.used = True
                db.session.commit()
                
                # Proceed to normal CTFd registration logic
                return original_register(*args, **kwargs)
            else:
                return original_register(*args, **kwargs)
                
        app.view_functions['auth.register'] = custom_register
