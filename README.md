# Jednoduchá aplikace pro sdílení souborů, textu a obrázků

## Lokální spuštění (Docker Compose)

1. Spusť v root složce projektu:
   
   docker-compose up --build

2. Otevři prohlížeč na http://localhost:5000

## Kubernetes nasazení

1. Postav image a nahraj na Docker Hub (nezapomeň změnit image v k8s-deployment.yaml):
   
   docker build -t yourdockerhub/share-app:latest ./app
   docker push yourdockerhub/share-app:latest

2. V Kubernetes nasad:
   
   kubectl apply -f uploads-pvc.yaml
   kubectl apply -f k8s-deployment.yaml

3. Přístup na NodePort 30050 (např. http://<node-ip>:30050)

## Funkce
- Upload/download souborů, textu, obrázků přes share-id
- Share-id lze zadat nebo se vygeneruje
- Seznam souborů/textu pro share-id

