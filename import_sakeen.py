import os
import shutil
import hashlib
import time
from CTFd import create_app
from CTFd.models import db, Challenges, Flags, Tags, ChallengeFiles, Files
import importlib

app = create_app()

with app.app_context():
    whale_models = importlib.import_module("CTFd.plugins.ctfd-whale.models")
    DynamicDockerChallenge = whale_models.DynamicDockerChallenge

def upload_file(challenge_id, filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with app.app_context():
        filename = os.path.basename(filepath)
        hash_dir = hashlib.md5((filename + str(time.time())).encode()).hexdigest()
        
        upload_folder = app.config.get('UPLOAD_FOLDER')
        dest_dir = os.path.join(upload_folder, hash_dir)
        os.makedirs(dest_dir, exist_ok=True)
        dest_path = os.path.join(dest_dir, filename)
        
        shutil.copy2(filepath, dest_path)
        
        location = f"{hash_dir}/{filename}"
        
        chal_file = ChallengeFiles(challenge_id=challenge_id, location=location)
        db.session.add(chal_file)
        db.session.commit()
        print(f"Uploaded {filepath} -> {location}")

def get_file_content(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read().strip()
    return "Missing."

def create_static(name, category, desc_path, flag_str, file_paths=None):
    with app.app_context():
        chal = Challenges.query.filter_by(name=name).first()
        if chal:
            print(f"Skipped {name}, already exists")
            return
            
        description = get_file_content(desc_path)
        
        chal = Challenges(
            name=name,
            category=category,
            description=description,
            value=500,
            type="standard",
            state="visible"
        )
        db.session.add(chal)
        db.session.commit()
        chal_id = chal.id
        
        if flag_str:
            f = Flags(challenge_id=chal_id, content=flag_str, type="static")
            db.session.add(f)
            db.session.commit()
        
        if file_paths:
            for path in file_paths:
                upload_file(chal_id, path)
                
        print(f"Created static challenge: {name}")

def create_dynamic(name, category, desc_path, image_name, redirect_port, flag_prefix=None):
    with app.app_context():
        chal = Challenges.query.filter_by(name=name).first()
        if chal:
            print(f"Skipped {name}, already exists")
            return
            
        description = get_file_content(desc_path)
        
        chal = DynamicDockerChallenge(
            name=name,
            category=category,
            description=description,
            value=500,
            type="dynamic_docker",
            state="visible",
            initial=500,
            minimum=50,
            decay=20,
            docker_image=image_name,
            redirect_type="direct",
            redirect_port=redirect_port,
            memory_limit="128m",
            cpu_limit=0.5,
            flag_prefix=flag_prefix
        )
        db.session.add(chal)
        db.session.commit()
        
        print(f"Created dynamic challenge: {name} ({image_name} on port {redirect_port})")


if __name__ == "__main__":
    base = '/tmp/sakeen_challenges'
    
    # 1. Broken_synchronization (Static)
    create_static(
        name="Broken Synchronization",
        category="Binary",
        desc_path=f"{base}/Binary/Broken_synchronization/challenge/description.txt",
        flag_str="expX{m47r1x_7yp3_c0nfu510n_d3c3n7r4l1z3d_n0d3}",
        file_paths=[
            f"{base}/Binary/Broken_synchronization/challenge/node",
            f"{base}/Binary/Broken_synchronization/challenge/node.c"
        ]
    )
    
    # 2. void kernel (Static)
    create_static(
        name="Void Kernel",
        category="Binary",
        desc_path=f"{base}/Binary/void kernel/README.md",
        flag_str="expX{v01d_k3rn3l_3sc4p3}",
        file_paths=[f"{base}/Binary/void kernel/dist/void_kernel_test"]
    )
    
    # 3. Animalia (Static)
    create_static(
        name="Animalia",
        category="Crypto",
        desc_path=f"{base}/Crypto/Animalia/solve/writeup.md",
        flag_str="expX{4n1m4l14_m4s73r_573g0}",
        file_paths=[
            f"{base}/Crypto/Animalia/chall/challenge.zip",
            f"{base}/Crypto/Animalia/chall/enc.txt"
        ]
    )
    
    # 4. The-Last-Timeline (Static)
    create_static(
        name="The Last Timeline",
        category="Crypto",
        desc_path=f"{base}/Crypto/The-Last-Timeline/description/description.txt",
        flag_str="expX{1n_4_w0r1d_w1th0ut_t1m3_w3_4r3_g0d5}",
        file_paths=[
            f"{base}/Crypto/The-Last-Timeline/challenge/chall.py"
        ]
    )
    
    # 5. the_cascade (Static)
    create_static(
        name="The Cascade",
        category="Crypto",
        desc_path=f"{base}/Crypto/the_cascade/description/description.txt",
        flag_str="expX{c4sc4d1ng_f41lur3s_4r3_b34ut1fu1}",
        file_paths=[
            f"{base}/Crypto/the_cascade/challenge/blob2.bin",
            f"{base}/Crypto/the_cascade/challenge/challenge.py",
            f"{base}/Crypto/the_cascade/challenge/curve_params.txt",
            f"{base}/Crypto/the_cascade/challenge/phase1_params.txt"
        ]
    )
    
    # 6. quantum (Dynamic)
    create_dynamic(
        name="Quantum Notes",
        category="Binary",
        desc_path=f"{base}/Binary/quantum/Description/description.txt",
        image_name="osama99071/quantum",
        redirect_port=1337,
        flag_prefix="qu4ntum_3nt4ngl3m3nt_0f_m3m0ry"
    )
    
    # 7. red-pill (Dynamic)
    create_dynamic(
        name="Red Pill",
        category="Binary",
        desc_path=f"{base}/Binary/red-pill/solve/writeup_player.md",
        image_name="osama99071/red-pill",
        redirect_port=1337,
        flag_prefix="r3d_p1ll_3sc4p3_th3_m4tr1x"
    )
    
    # 8. web-chain-ctf (Static - Hosted via Docker Compose)
    create_static(
        name="Web Chain",
        category="Web",
        desc_path=f"{base}/web/web-chain-ctf/chall/README.md",
        flag_str="expX{4Lr34dY_p01S0N3d_8Y_Ch4CH3}",
        file_paths=[]
    )
