INSERT INTO whale_redirect_template (`key`, `frp_template`, `access_template`) VALUES ('http_direct', '
[http_direct_{{ container.user_id|string }}-{{ container.uuid }}]
type = tcp
local_ip = {{ container.user_id|string }}-{{ container.uuid }}
local_port = {{ container.challenge.redirect_port }}
remote_port = {{ container.port }}
use_compression = true
', 'http://{{ get_config("whale:frp_direct_ip_address", "127.0.0.1") }}:{{ container.port }}/');

UPDATE dynamic_docker_challenge SET redirect_type = 'http_direct' WHERE id IN (11, 12, 20, 21, 22, 37);
