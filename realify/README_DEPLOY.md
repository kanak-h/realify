# Realify AI Deployment Guide (Render)

This project is prepared for easy deployment on [Render](https://render.com/).

## Prerequisites
1. A GitHub account.
2. A Render account.

## Step-by-Step Deployment

1. **Upload to GitHub**:
   - Create a new repository on GitHub.
   - Initialize git in your project folder: `git init`
   - Add all files: `git add .`
   - Commit: `git commit -m "Initial commit"`
   - Push to GitHub: Follow the instructions on your GitHub repo page.

2. **Deploy on Render**:
   - Go to your [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.
   - **Configuration**:
     - **Name**: `realify-ai` (or anything you like)
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
   - **Environment Variables** (Optional but recommended):
     - Click **Advanced** -> **Add Environment Variable**.
     - Key: `SECRET_KEY`, Value: `your_random_secret_string`
     - Key: `PYTHON_VERSION`, Value: `3.10.0` (or your preferred version)

3. **Finish**:
   - Click **Create Web Service**.
   - Once the build is complete, Render will provide a public URL like `https://realify-ai.onrender.com`.

## Note on File Storage
This app uses a local `uploads` folder and `SQLite` database. On Render's free tier, these files are **ephemeral** (they will be deleted every time the server restarts). 

**Pro Tip for Permanence:**
If you need permanent data on Render, you should:
1.  **Database**: Use **Render PostgreSQL** instead of SQLite (I can help you change the config if needed).
2.  **Files**: Use **Cloudinary** or **AWS S3** for image/video storage, as local files are cleared on every deploy/restart.

For testing and project demonstrations, the current setup is perfectly fine!
