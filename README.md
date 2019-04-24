# weaviate-infra <img alt='Weaviate logo' src='https://raw.githubusercontent.com/creativesoftwarefdn/weaviate/19de0956c69b66c5552447e84d016f4fe29d12c9/docs/assets/weaviate-logo.png' width='180' align='right' />

> Cloud scripts to deploy weaviate to Kuberentes clusters, including Terraform setup scripts for GKE and AKS, as well as a vendor-agnostic Helm chart.

See [creativesoftwarefdn/weaviate](https://github.com/creativesoftwarefdn/weaviate) for more information about Weaviate - The decentralized knowledge graph.

## Deploy Weaviate via Helm

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
