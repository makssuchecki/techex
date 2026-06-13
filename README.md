## Monitoring

### Install Helm

winget install Helm.Helm

### Add repository

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

### Create namespace

kubectl create namespace monitoring

### Install monitoring

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f k8s/monitoring/values.yaml

### Grafana

kubectl port-forward -n monitoring service/monitoring-grafana 3000:80

Login: admin
Password: admin123
