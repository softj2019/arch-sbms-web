#!/usr/bin/env bash
set -euo pipefail

DEVICE_USER="${DEVICE_USER:-admin}"
DEVICE_PASSWORD="${DEVICE_PASSWORD:-}"
SSH_CONNECT_TIMEOUT="${SSH_CONNECT_TIMEOUT:-10}"
SSH_STRICT_HOST_KEY_CHECKING="${SSH_STRICT_HOST_KEY_CHECKING:-no}"

device_ssh() {
  local host="$1"
  shift
  local remote_command="$1"
  local py_script
  read -r -d '' py_script <<'PY' || true
import os
import subprocess
import sys

host = sys.argv[1]
remote_command = sys.argv[2]
user = os.environ["DEVICE_USER"]
password = os.environ.get("DEVICE_PASSWORD", "")
timeout = os.environ.get("SSH_CONNECT_TIMEOUT", "10")
strict = os.environ.get("SSH_STRICT_HOST_KEY_CHECKING", "no")
stdin_data = sys.stdin.buffer.read()

base_args = [
    "-o",
    f"ConnectTimeout={timeout}",
    "-o",
    f"StrictHostKeyChecking={strict}",
    "-o",
    "UserKnownHostsFile=/dev/null",
]

if password:
    import pexpect

    child = pexpect.spawn(
        "ssh",
        [*base_args, f"{user}@{host}", remote_command],
        encoding="utf-8",
        timeout=300,
    )
    child.setecho(False)
    while True:
        idx = child.expect(
            [
                r"Are you sure you want to continue connecting \(yes/no(/\[fingerprint\])?\)\?",
                r"[Pp]assword:",
                pexpect.EOF,
            ]
        )
        if idx == 0:
            child.sendline("yes")
            continue
        if idx == 1:
            child.sendline(password)
            break
        if idx == 2:
            sys.stdout.write(child.before)
            sys.exit(child.exitstatus or 1)

    if stdin_data:
        child.send(stdin_data.decode("utf-8"))
        child.sendeof()

    child.expect(pexpect.EOF)
    child.close()
    sys.stdout.write(child.before)
    exit_code = child.exitstatus
    if exit_code is None:
        exit_code = 0 if child.signalstatus is None else 1
    sys.exit(exit_code)

proc = subprocess.run(
    ["ssh", *base_args, f"{user}@{host}", remote_command],
    input=stdin_data,
)
sys.exit(proc.returncode)
PY

  DEVICE_USER="$DEVICE_USER" \
  DEVICE_PASSWORD="$DEVICE_PASSWORD" \
  SSH_CONNECT_TIMEOUT="$SSH_CONNECT_TIMEOUT" \
  SSH_STRICT_HOST_KEY_CHECKING="$SSH_STRICT_HOST_KEY_CHECKING" \
  python3 -c "$py_script" "$host" "$remote_command"
}

device_scp_to() {
  local src="$1"
  local host="$2"
  local dest="$3"
  local py_script
  read -r -d '' py_script <<'PY' || true
import os
import subprocess
import sys

src = sys.argv[1]
host = sys.argv[2]
dest = sys.argv[3]
user = os.environ["DEVICE_USER"]
password = os.environ.get("DEVICE_PASSWORD", "")
timeout = os.environ.get("SSH_CONNECT_TIMEOUT", "10")
strict = os.environ.get("SSH_STRICT_HOST_KEY_CHECKING", "no")

base_args = [
    "-o",
    f"ConnectTimeout={timeout}",
    "-o",
    f"StrictHostKeyChecking={strict}",
    "-o",
    "UserKnownHostsFile=/dev/null",
]

if password:
    import pexpect

    child = pexpect.spawn(
        "scp",
        [*base_args, src, f"{user}@{host}:{dest}"],
        encoding="utf-8",
        timeout=300,
    )
    child.setecho(False)
    while True:
        idx = child.expect(
            [
                r"Are you sure you want to continue connecting \(yes/no(/\[fingerprint\])?\)\?",
                r"[Pp]assword:",
                pexpect.EOF,
            ]
        )
        if idx == 0:
            child.sendline("yes")
            continue
        if idx == 1:
            child.sendline(password)
            continue
        if idx == 2:
            child.close()
            sys.stdout.write(child.before)
            exit_code = child.exitstatus
            if exit_code is None:
                exit_code = 0 if child.signalstatus is None else 1
            sys.exit(exit_code)

proc = subprocess.run(["scp", *base_args, src, f"{user}@{host}:{dest}"])
sys.exit(proc.returncode)
PY

  DEVICE_USER="$DEVICE_USER" \
  DEVICE_PASSWORD="$DEVICE_PASSWORD" \
  SSH_CONNECT_TIMEOUT="$SSH_CONNECT_TIMEOUT" \
  SSH_STRICT_HOST_KEY_CHECKING="$SSH_STRICT_HOST_KEY_CHECKING" \
  python3 -c "$py_script" "$src" "$host" "$dest"
}
