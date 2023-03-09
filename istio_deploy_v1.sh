#####Download istio:
curl -L https://istio.io/downloadIstio | sh -

cd istio-1.13.0
#####export istioctl:
export PATH=$PWD/bin:$PATH

istioctl install --set profile=demo -y
kubectl label namespace default istio-injection=enabled

###build app
cd ../app/services_v1
chmod +x build-all.sh
./build-all.sh

###apply
cd ../traffic
kubectl apply -f bank-gateway-all.yaml

cd ../v1
chmod +x run.sh
./run.sh


kubectl get services
kubectl get pods

cd ../../istio-1.13.0

istioctl analyze


###### :
kubectl get svc istio-ingressgateway -n istio-system

export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}')
export INGRESS_HOST=127.0.0.1
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT

echo "$GATEWAY_URL"
