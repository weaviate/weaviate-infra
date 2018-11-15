# Setup Kubernetes Cluster with Kops (GCP)

This document is based on the official Kops documentation: https://github.com/kubernetes/kops/blob/master/docs/tutorial/gce.md

## Pre-reqs

- kops (https://github.com/kubernetes/kops/blob/master/docs/install.md)
- kubectl (https://github.com/kubernetes/kops/blob/master/docs/install.md)
- gcloud (https://cloud.google.com/sdk/downloads)

## Setup cluster

Run steps manually as below or use the `kopsGCP.sh` script

```
export KOPS_STATE_STORE=gs://weaviate-kubernetes-clusters/
export CLUSTER_NAME=weaviate.k8s.local
```

Create State Store

```
gsutil mb ${KOPS_STATE_STORE}
```

```
PROJECT=`gcloud config get-value project`
export KOPS_FEATURE_FLAGS=AlphaAllowGCE 
```

Create cluster configuration:

```
kops create cluster ${CLUSTER_NAME} \
	--zones europe-west1-b \
	--master-count 3 \
	--state ${KOPS_STATE_STORE} \
	--project=${PROJECT} \
	--node-count=5 \
	--node-size=n1-standard-4
```

Create the cluster (this will take several minutes)

```
kops update cluster --state ${KOPS_STATE_STORE} ${CLUSTER_NAME} --yes
```


After a few minutes run

```
kops validate cluster
```

If everything is up, verify you can connect to the cluster:

```
kubectl get nodes
```