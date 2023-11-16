# bank-app-docker-kubernetes-istio
An application with a simple operation that simulates an ATM. The task was to split the application into separate microservices, which were then located in separate Docker containers. The Kubernetes platform was used to manage the containers. The final step was to test the communication in the application using istio services.

<!-- INFO -->
## 1. Info

Project prepared during the exhange in the University of Alcala. In the /doc folder there is a document with a description of the project.

<!-- SCREENSHOTS -->
## 2. Running pods and traffic visualization

| ![pods running](https://github.com/tomaszsojka/bank-app-docker-kubernetes-istio/blob/main/doc/screenshots/pods.png?raw=true) |
|:--:|
| *Running services in 3 instances, 2 of the services are working in 2 different versions.* |
| ![istio traffic visualization](https://github.com/tomaszsojka/bank-app-docker-kubernetes-istio/blob/main/doc/screenshots/traffic_istio.png?raw=true) |
| *Visualization of the traffic between services, using Istio.* |

<!-- FRAMEWORKS -->
## 3. Frameworks

- Docker,
- Kubernetes,
- Istio.

- Node.js,
- Express.js,
- MySQL,
- Redis.



