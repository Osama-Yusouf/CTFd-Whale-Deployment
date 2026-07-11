import random
import uuid
from datetime import datetime

from jinja2 import Template

from CTFd.utils import get_config
from CTFd.models import db
from CTFd.plugins.dynamic_challenges import DynamicChallenge


class WhaleConfig(db.Model):
    key = db.Column(db.String(length=128), primary_key=True)
    value = db.Column(db.Text)

    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __repr__(self):
        return "<WhaleConfig {0} {1}>".format(self.key, self.value)


class WhaleRedirectTemplate(db.Model):
    key = db.Column(db.String(20), primary_key=True)
    frp_template = db.Column(db.Text)
    access_template = db.Column(db.Text)

    def __init__(self, key, access_template, frp_template):
        self.key = key
        self.access_template = access_template
        self.frp_template = frp_template

    def __repr__(self):
        return "<WhaleRedirectTemplate {0}>".format(self.key)


class DynamicDockerChallenge(DynamicChallenge):
    __mapper_args__ = {"polymorphic_identity": "dynamic_docker"}
    id = db.Column(
        db.Integer, db.ForeignKey("dynamic_challenge.id", ondelete="CASCADE"), primary_key=True
    )

    memory_limit = db.Column(db.Text, default="128m")
    cpu_limit = db.Column(db.Float, default=0.5)
    dynamic_score = db.Column(db.Integer, default=0)

    docker_image = db.Column(db.Text, default=0)
    redirect_type = db.Column(db.Text, default=0)
    redirect_port = db.Column(db.Integer, default=0)

    def __init__(self, *args, **kwargs):
        kwargs["initial"] = kwargs["value"]
        super(DynamicDockerChallenge, self).__init__(**kwargs)


class WhaleContainer(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(None, db.ForeignKey("users.id"))
    challenge_id = db.Column(None, db.ForeignKey("challenges.id"))
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    renew_count = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.Integer, default=1)
    uuid = db.Column(db.String(256))
    port = db.Column(db.Integer, nullable=True, default=0)
    flag = db.Column(db.String(128), nullable=False)

    # Relationships
    user = db.relationship(
        "Users", foreign_keys="WhaleContainer.user_id", lazy="select")
    challenge = db.relationship(
        "DynamicDockerChallenge", foreign_keys="WhaleContainer.challenge_id", lazy="select"
    )

    @property
    def http_subdomain(self):
        return Template(get_config(
            'whale:template_http_subdomain', '{{ container.uuid }}'
        )).render(container=self)

    def __init__(self, user_id, challenge_id):
        self.user_id = user_id
        self.challenge_id = challenge_id
        self.start_time = datetime.now()
        self.renew_count = 0
        self.uuid = str(uuid.uuid4())
        
        # Determine flag prefix based on challenge name
        from CTFd.models import Challenges
        chal = Challenges.query.filter_by(id=challenge_id).first()
        chal_name = chal.name if chal else ""
        
        if chal_name == "Operation THEYA":
            prefix = "expX{m3m0ry_p01s0n1ng_r4g_b0und4ry_f41lur3"
        elif chal_name == "PATHS protocol":
            prefix = "expX{p4ths_n3v3r_f0rg3t_th3_f1rst_m3m0ry_th3_f0und1ng_m0d3_activ4t3d"
        elif chal_name == "Shattered-Dimensions":
            prefix = "expX{r34l1ty_r3st0r3d"
        elif chal_name == "DNA Forgery":
            prefix = "expX{0mn1tr1x_m4st3r_c0ntr0l_unl0ck3d"
        elif chal_name == "webtrace":
            prefix = "expX{w17h_6r347_p0w3r_c0m35_6r347_r35p0n5181117y"
        else:
            prefix = "expX{dynamic"
            
        random_str = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=8))
        self.flag = f"{prefix}_{random_str}}}"

    @property
    def user_access(self):
        return Template(WhaleRedirectTemplate.query.filter_by(
            key=self.challenge.redirect_type
        ).first().access_template).render(container=self, get_config=get_config)

    @property
    def frp_config(self):
        return Template(WhaleRedirectTemplate.query.filter_by(
            key=self.challenge.redirect_type
        ).first().frp_template).render(container=self, get_config=get_config)

    def __repr__(self):
        return "<WhaleContainer ID:{0} {1} {2} {3} {4}>".format(self.id, self.user_id, self.challenge_id,
                                                                self.start_time, self.renew_count)
