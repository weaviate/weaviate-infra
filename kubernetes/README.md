# weaviate - Kubernetes configuration

This directory contains kubernetes configurations for running Weaviate and it's dependencies on Kubernetes.

## Pre-Reqs

* A running kubernetes cluster
* A storage provisioner on the cluster (standard on hosted k8s and minikube)
* kubectl (configured to access your cluster)

## To Deploy

```
$ kubectl apply -f ./ 
```

## Known issues

As there are dependencies between the services, the above deployment will take some time (5 mins) and generate some errors/restarts in the process. This will be handled once the Helm charts are created (https://github.com/SeMI-network/weaviate-infra/issues/1).

