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

See: ./helm/weaviate/README.md
