# Context

## Remote Server
- IP: 13.207.91.86
- User: ubuntu
- SSH Key: C:\Dev\ExploitX\into-the-void.pem

## Tasks
1. Run docker on the remote server in the `CTFd-Whale-Deployment` directory.
2. Provide the IP and port to access the site.
3. Update `context.md` after each change.
4. Update graphify (if applicable/requested).

## Current Status
- Docker containers are running on the remote machine.
- Fixed a 500 Internal Server Error caused by incorrect ownership of the `.data/redis` directory and missing execute permissions on `docker-entrypoint.sh`.
- Site is now fully accessible via IP: `13.207.91.86` on port `8000` (CTFd direct) or port `80` (nginx proxy).
- Needs CTFd Whale plugin configured to use the Elastic IP (`13.207.91.86`) and Swarm Node (`ip-172-31-4-102`).
- Fixed `frps` sub_domain routing by updating `docker-compose.yml` and configuring it for `13.207.91.86.nip.io`.
- Added a "Max Container Per User" setting to CTFd Whale Plugin to allow players to spawn multiple instances. Modified database queries and control logic to support this, and pushed changes to the live remote server.