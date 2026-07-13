from CTFd import create_app
from CTFd.models import db, Challenges, Flags

app = create_app()

def update_flag(name, flag):
    c = Challenges.query.filter_by(name=name).first()
    if c:
        f = Flags.query.filter_by(challenge_id=c.id).first()
        f.content = flag
        db.session.commit()
        print(f'Updated {name} flag to {flag}')

with app.app_context():
    update_flag('Universe Weights', 'expX{n3ur4l_ph4nt0ms_d3c31v3_th3_gr4d13nt_534rch3r}')
    update_flag('Nexus Core', 'expX{mU1t1V3rS3_jUmp3r!}')
    update_flag('Multiverse Lock', 'expX{mU1t1v3rs3_p4r4d0x_f1nd3r_99}')
