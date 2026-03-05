# 📄 `docs/deployment-guide.md`

````markdown
# 🚀 Deployment Guide (Google Cloud Platform)

This document describes the complete deployment process of the **Fitness Microservices Platform** on  
Google Cloud Platform.

The system is deployed using:

- Google Cloud Run (microservices)
- Google Artifact Registry (Docker images)
- Google Compute Engine (RabbitMQ VM)
- VPC Connector for internal communication
- Supabase PostgreSQL
- MongoDB Atlas
- Firebase for frontend

---

# 1️⃣ Initialize GCP Environment

Initialize gcloud and set the project.

```bash
gcloud init
gcloud config set project fitness-microservices
````

Enable required services.

```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

# 2️⃣ Create Artifact Registry (Docker Repository)

Create a repository to store container images.

```bash
gcloud artifacts repositories create fitness-repo \
  --repository-format=docker \
  --location=asia-south1
```

Configure Docker authentication.

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

# 3️⃣ Build and Push Docker Images

Tag and push service images to Artifact Registry.

Example for **User Service**:

```bash
docker tag userservice:v3 \
asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/userservice:v3

docker push \
asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/userservice:v3
```

Repeat similar steps for:

* api-gateway (latest: v5)
* activityservice (latest: v4)
* aiservice (latest: v3)
* configserver (latest: v5)
* keycloak (latest: 26.0)

---

# 4️⃣ Create VPC Network for Services

Create a custom VPC network.

```bash
gcloud compute networks create internal-services-vpc \
  --project=fitness-microservices \
  --subnet-mode=custom
```

Create a VPC Connector for Cloud Run services.

```bash
gcloud compute networks vpc-access connectors create run-connector-v2 \
  --region=asia-south1 \
  --network=internal-services-vpc \
  --range=10.8.0.0/28
```

---

# 5️⃣ Deploy Config Server

```bash
gcloud run deploy configserver \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/configserver:v5 \
  --region=asia-south1 \
  --platform=managed \
  --vpc-connector=run-connector-v2 \
  --vpc-egress=private-ranges-only \
  --ingress=all \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1
```

Service URL:

```
https://configserver-xxxxx.asia-south1.run.app
```

---

# 6️⃣ Deploy User Service

```bash
gcloud run deploy userservice \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/userservice:v3 \
  --region=asia-south1 \
  --platform=managed \
  --vpc-connector=run-connector-v2 \
  --vpc-egress=private-ranges-only \
  --ingress=all \
  --allow-unauthenticated \
  --set-env-vars="CONFIG_SERVER_URL=<CONFIG_SERVER_URL>,DB_URL=<POSTGRES_URL>,DB_USERNAME=<USERNAME>,DB_PASSWORD=<PASSWORD>"
```

---

# 7️⃣ Deploy Activity Service

```bash
gcloud run deploy activityservice \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/activityservice:v4 \
  --region=asia-south1 \
  --platform=managed \
  --vpc-connector=run-connector-v2 \
  --vpc-egress=private-ranges-only \
  --ingress=all \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --set-env-vars="RABBITMQ_HOST=<VM_IP>,RABBITMQ_USER=<USER>,RABBITMQ_PASSWORD=<PASSWORD>,CONFIG_SERVER_URL=<CONFIG_SERVER_URL>,USER_SERVICE_URL=<USER_SERVICE_URL>,MONGO_URI=<MONGODB_URI>"
```

---

# 8️⃣ Deploy AI Service

```bash
gcloud run deploy aiservice \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/aiservice:v3 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --ingress=all \
  --vpc-connector=run-connector-v2 \
  --vpc-egress=private-ranges-only \
  --memory=1Gi \
  --cpu=1 \
  --set-env-vars="RABBITMQ_HOST=<VM_IP>,RABBITMQ_USER=<USER>,RABBITMQ_PASSWORD=<PASSWORD>,MONGO_URI=<MONGO_URI>,CONFIG_SERVER_URL=<CONFIG_SERVER_URL>,GEMINI_API_KEY=<API_KEY>"
```

---

# 9️⃣ Deploy API Gateway

```bash
gcloud run deploy api-gateway \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/api-gateway:v5 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --ingress=all \
  --vpc-connector=run-connector-v2 \
  --vpc-egress=private-ranges-only \
  --set-env-vars="CONFIG_SERVER_URL=<CONFIG_SERVER_URL>,USER_SERVICE_URL=<USER_SERVICE_URL>,ACTIVITY_SERVICE_URL=<ACTIVITY_SERVICE_URL>,AI_SERVICE_URL=<AI_SERVICE_URL>"
```

---

# 🔐 Deploy Keycloak (Authentication Server)

```bash
gcloud run deploy keycloak \
  --image=asia-south1-docker.pkg.dev/fitness-microservices/fitness-repo/keycloak:26.0 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --cpu=2 \
  --memory=2Gi \
  --timeout=3600 \
  --concurrency=20 \
  --set-env-vars="KC_BOOTSTRAP_ADMIN_USERNAME=<ADMIN>,KC_BOOTSTRAP_ADMIN_PASSWORD=<PASSWORD>,KC_DB_URL=<POSTGRES_URL>" \
  --command=/opt/keycloak/bin/kc.sh \
  --args=start
```

---

# 🐇 Deploy RabbitMQ on Compute Engine VM

RabbitMQ was deployed on a **Compute Engine VM** due to limitations encountered while deploying it on Cloud Run.

---

## Create Firewall Rules

```bash
gcloud compute firewall-rules create allow-rabbitmq \
  --allow tcp:5672,tcp:15672 \
  --source-ranges 0.0.0.0/0 \
  --target-tags rabbitmq-vm
```

---

## Create VM Instance

```bash
gcloud compute instances create rabbitmq-vm \
  --zone=asia-south1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=rabbitmq-vm \
  --boot-disk-size=20GB
```

Connect to VM:

```bash
gcloud compute ssh rabbitmq-vm --zone=asia-south1-a
```

---

# Install RabbitMQ

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y rabbitmq-server
```

Start and enable service:

```bash
sudo systemctl enable rabbitmq-server
sudo systemctl start rabbitmq-server
```

Enable management plugin:

```bash
sudo rabbitmq-plugins enable rabbitmq_management
```

---

# Configure RabbitMQ Users

```bash
sudo rabbitmqctl add_user admin admin
sudo rabbitmqctl delete_user guest
```

Create virtual host:

```bash
sudo rabbitmqctl add_vhost /activityservice
```

Grant permissions:

```bash
sudo rabbitmqctl set_permissions -p /activityservice admin ".*" ".*" ".*"
```

---

# Configure RabbitMQ Network Access

Edit configuration:

```bash
sudo nano /etc/rabbitmq/rabbitmq.conf
```

Add:

```
listeners.tcp.default = 0.0.0.0:5672
management.tcp.port = 15672
management.tcp.ip = 0.0.0.0
```

Restart service:

```bash
sudo systemctl restart rabbitmq-server
```

---

# Attach VM to VPC Network

```bash
gcloud compute instances network-interfaces update rabbitmq-vm \
  --zone=asia-south1-a \
  --network-interface=nic0 \
  --network=internal-services-vpc
```

Restart the VM:

```bash
gcloud compute instances start rabbitmq-vm \
  --zone=asia-south1-a
```

---

# 🌐 Final Deployment Architecture

Frontend:

* React + Vite deployed on Firebase Hosting

Backend:

* API Gateway
* User Service
* Activity Service
* AI Service
* Config Server
* Keycloak

Infrastructure:

* Cloud Run (microservices)
* Compute Engine VM (RabbitMQ)
* MongoDB Atlas
* Supabase PostgreSQL

```