# Into The Void - CTFd Administration Guide

Welcome to the "Into The Void" CTFd deployment. This platform has been heavily customized with a futuristic aesthetic, dynamic Dockerized challenge support, advanced anti-cheat mechanisms, and automated Discord integrations. 

This guide provides instructions for seniors and admins on how to operate and maintain these features.

---

## 1. Creating Dynamic Docker Challenges (CTFd-Whale)
This platform uses the `ctfd-whale` plugin to isolate players by spinning up a private, dynamic Docker container for every team that requests one.

**How to add a new dynamic challenge:**
1. Navigate to the CTFd Admin Panel -> **Challenges** -> **Create Challenge**.
2. Select **dynamic_docker** as the challenge type.
3. Fill out the challenge Name, Category, Description, and Points. (You can also select "Dynamic" point decay so the points decrease as more people solve it).
4. Under the Docker configuration tab, input the **Docker Image** (e.g., `osama99071/quantum:latest`). Make sure the image is publicly available on Docker Hub or pulled locally.
5. Set the **Frp Route Port** to the exact internal port your challenge listens on (e.g., `1337` for `socat`/`ncat` binaries, or `80` for web servers).
6. Set the **Flag**. Ensure the format matches the dynamic flag generation script inside your Docker image.
7. Click **Finish**.

**Troubleshooting Instances:**
- If the containers are spawning but dropping connections immediately, ensure the network is properly configured. Go to **Admin Panel -> Whale -> Settings -> Docker Container** and verify the Network is set to `ctfd-whale-deployment_containers`.
- To manually clean up containers, go to **Admin Panel -> Whale -> Containers** and click "Destroy" on orphaned instances.

---

## 2. Discord Webhook Notifications
We use a modern webhook plugin to broadcast platform events directly to your Discord server (e.g., First Bloods, Solves, New Registrations).

**How to configure:**
1. In your Discord server, go to **Server Settings -> Integrations -> Webhooks** and copy the Webhook URL.
2. In CTFd, navigate to **Admin Panel -> Plugins -> Webhooks**.
3. Click **Create Webhook**.
4. Set the provider to **Discord**, paste your URL, and check the boxes for the events you want to broadcast (e.g., `challenge_solved`, `first_blood`).
5. You can optionally customize the text and colors of the Discord embeds directly in this menu.

---

## 3. Bot Protection (Google reCAPTCHA)
To prevent bots from brute-forcing registrations and taking down the server, reCAPTCHA is integrated into the registration flow.

**How to configure:**
1. Visit the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) and generate a **v2 Checkbox** Site Key and Secret Key.
2. In CTFd, go to **Admin Panel -> Settings**.
3. Locate the **reCAPTCHA** fields and paste in your keys.
*(Note: To prevent the application from crashing before you add your real keys, dummy environment variables are currently hardcoded in `docker-compose.yml`. You may replace those with your real keys later).*

---

## 4. Cheat Detection (Flag Sharing Detector)
We have a custom-built, proprietary plugin installed at `CTFd/plugins/flag_sharing_detector` that perfectly catches players sharing flags on dynamic container challenges.

**How to use it:**
1. As an admin, navigate to **`/admin/cheat-detection`** (or find it in the admin menus).
2. The dashboard automatically joins the `Submissions` table with the `WhaleContainer` table. 
3. If Team A submits a dynamic flag that was specifically generated for Team B's container, it will instantly flag them and display the Cheater, the Victim, the Challenge, and the Timestamp.



---

## 5. Preventing Hint Smurfing (Burner Accounts)
To prevent players from creating fake "burner" accounts to spend points on hints without affecting their main team score, you MUST lock registration once the CTF officially starts.

**How to lock registration:**
1. Go to **Admin Panel -> Config -> Visibility** (Under the "Access" section on the left sidebar).
2. Look for **Registration Visibility**.
3. Change it from "Public" to **"Private"** or **"Hidden"**.
4. Once this is set, nobody can create an account mid-game. If a legitimate player needs an account late, an Admin must manually create it for them in the Admin Panel -> Users menu.

---

## 6. Theme and Aesthetics
The theme is strictly bound to the `CTFd/themes/into-the-void/` directory. All colors, CSS, and HTML assets are authored under the name Mohammed Osama Yusouf SM. Do not use standard CTFd themes, as they will lack the custom visual styles required for this event.
