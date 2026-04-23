#!/bin/bash
# Dubbelklik om de scanner handmatig te draaien.
# Draait vanaf de directory waar dit bestand staat.

cd "$(dirname "$0")"
/usr/bin/python3 jm_email_scanner.py
echo ""
echo "Druk op Enter om dit venster te sluiten..."
read
