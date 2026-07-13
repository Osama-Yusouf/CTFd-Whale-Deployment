from CTFd import create_app
from CTFd.models import db, Challenges

app = create_app()
with app.app_context():
    chal = Challenges.query.filter_by(name='Web Chain').first()
    if chal:
        chal.description = (
            "> \"We built a blazing-fast note platform with CDN caching, strict CSP, and "
            "enterprise-grade password resets. Nothing can go wrong.\"\n\n"
            "**Target:** http://127.0.0.1:8001"
        )
        db.session.commit()
        print("Description updated.")
