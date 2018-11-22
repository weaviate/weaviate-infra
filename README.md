# weaviate-infra


## Deploy Weavite via Helm

This section describes the process of deploying the Weaviate platform on Kubernetes using Helm

### Pre-reqs

* A kubernetes cluster
* kubctl 
* Helm (locally)

### Setup Helm

(alternatively use the `helm_setup.sh` script)

Create Helm Service Account

```
kubectl --namespace kube-system create sa tiller
```

Create Cluster Role Binding

```
kubectl create clusterrolebinding tiller \
    --clusterrole cluster-admin \
    --serviceaccount=kube-system:tiller
```

Install Helm on Cluster

```
helm init --service-account tiller
```

Update Helm Repos
```
helm repo update
```

### Install Weaviate

Create Weaviate Helm Package
```
$ cd ./helm/
$ helm package weaviate
Successfully packaged chart and saved it to: /Users/iancrosby/code/weaviate-infra/helm/weaviate-0.0.1.tgz
```

Install Helm Chart
```
helm install --name weaviate ./weaviate-0.0.1.tgz
```
