#!/bin/bash
cd ~/reel-maker/backend && source venv/bin/activate && uvicorn main:app --reload &
cd ~/reel-maker/frontend && npm start
