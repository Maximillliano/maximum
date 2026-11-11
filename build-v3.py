#!/usr/bin/env python3
# v3 теперь собирается вместе с остальными: python3 build-v2.py
import subprocess,sys;subprocess.run([sys.executable,"build-v2.py"],check=True)
