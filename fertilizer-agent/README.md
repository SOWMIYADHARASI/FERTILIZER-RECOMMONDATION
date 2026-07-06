# 🌱 Fertilizer Recommendation Agent - Deployment & Architecture Manual

This directory contains the production-ready Python Flask, MongoDB, and ChromaDB version of the **AI-powered Fertilizer Recommendation Agent**. It uses a trained **Random Forest Classifier** for crop nutritional diagnostics and integrates the **Google Gemini API** for semantic Retrieval-Augmented Generation (RAG).

---

## 🛠️ Technology Stack & Architecture

- **Backend:** Python Flask Web Framework
- **Machine Learning Classifier:** Scikit-Learn (Random Forest, Decision Tree, SVM, Logistic Regression comparison)
- **Database Storage:** MongoDB (Auditing recommendations, logs, chat sessions)
- **Vector Database:** ChromaDB (Semantic context retrieval for RAG)
- **Generative AI:** Google Gemini API (`gemini-1.5-flash` via the `@google/genai` Python library)
- **Production Server:** Gunicorn & Nginx Reverse Proxy
- **Containerization:** Docker & Docker Compose

---

## 📁 Directory Structure

```
fertilizer-agent/
│
├── app.py                  # Main Flask Server Entry point
├── config.py               # Database and API environment configs
├── requirements.txt        # Python dependency manifest
├── Dockerfile              # Flask container definition
├── docker-compose.yml      # Multi-container orchestration (App + MongoDB)
├── chatbot.py              # Gemini Python API & Prompt Engineering engine
│
├── model/
│   ├── train_model.py      # Pipeline script (cleans, scales, compares, and dumps model)
│   └── model.pkl           # Trained Random Forest classifier binary
│
├── database/
│   ├── mongodb.py          # MongoDB client connector
│   └── chroma.py           # ChromaDB persistent client connector (RAG)
│
├── routes/                 # Blueprint endpoints
│   ├── home.py
│   ├── recommend.py
│   ├── chat.py
│   ├── history.py
│   └── admin.py
│
└── dataset/
    └── fertilizer.csv      # 500+ records clean training dataset
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have **Python 3.10+** and **MongoDB** running locally.

### 2. Install Dependencies
```bash
# Clone or navigate into the agent directory
cd fertilizer-agent

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 3. Configure Environments (`.env`)
Create a `.env` file in the root of the folder:
```env
FLASK_ENV=development
SECRET_KEY=agri_agent_secret_key
MONGO_URI=mongodb://localhost:27017/fertilizer_agent_db
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 4. Train the ML Model
Run the pipeline script to compare algorithms and save `model.pkl`:
```bash
python model/train_model.py
```

### 5. Boot the Server
```bash
python app.py
```
The Flask server will boot on `http://localhost:5000`.

---

## 🐳 Docker Deployment

The simplest way to deploy the entire stack (including the MongoDB service) is via Docker Compose.

```bash
# Build containers and run in detached (background) mode
docker compose up --build -d

# Check running containers
docker compose ps

# View real-time logs
docker compose logs -f
```
The application will bind to port `5000` on your host network.

---

## ☁️ AWS EC2 Production Deployment Guide (Step-by-Step)

Follow these directions to host the application inside an **AWS EC2 (Ubuntu 22.04 LTS)** instance securely behind **Nginx** and **Gunicorn**.

### Step 1: Provision EC2 Instance
1. Launch an **m5.large** or **t3.medium** EC2 instance with Ubuntu 22.04 LTS.
2. In the **Security Group**, allow inbound traffic on:
   - Port `22` (SSH)
   - Port `80` (HTTP)
   - Port `443` (HTTPS)

### Step 2: Install System Packages
SSH into your instance and run:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv git nginx mongodb -y
```

### Step 3: Clone Code and Create Service
1. Clone your project code:
   ```bash
   git clone <your-repo-link> /var/www/fertilizer-agent
   cd /var/www/fertilizer-agent/fertilizer-agent
   ```
2. Configure Python environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python model/train_model.py
   ```

### Step 4: Configure Gunicorn Service
Create a systemd service file to keep Gunicorn running in the background:
```bash
sudo nano /etc/systemd/system/gunicorn.service
```
Paste the following configuration:
```ini
[Unit]
Description=Gunicorn instance to serve Fertilizer Flask App
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/fertilizer-agent/fertilizer-agent
Environment="PATH=/var/www/fertilizer-agent/fertilizer-agent/venv/bin"
Environment="GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE"
ExecStart=/var/www/fertilizer-agent/fertilizer-agent/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```
Start and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### Step 5: Configure Nginx Reverse Proxy
Edit the default Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/default
```
Replace the file contents with the following:
```nginx
server {
    listen 80;
    server_name your_domain_or_ec2_public_ip;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/fertilizer-agent/fertilizer-agent/static/;
    }
}
```
Validate and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Configuration (HTTPS)
Secure your server with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain_name.com
```
Certbot will configure SSL certificates automatically.
