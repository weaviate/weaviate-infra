#!/usr/bin/env bash

KOPS_STATE_STORE=gs://weaviate-kubernetes-clusters/
CLUSTER_NAME=weaviate.k8s.local

echo Creating Kubernetes Cluster ${CLUSTER_NAME} on GCP with Kops.
echo Cluster state stored in ${KOPS_STATE_STORE}

# Fill fail if already exists. That's ok (?)
gsutil mb ${KOPS_STATE_STORE}

PROJECT=`gcloud config get-value project`

echo Using current GCP project: ${PROJECT}

# to unlock the GCE features
export KOPS_FEATURE_FLAGS=AlphaAllowGCE 

kops create cluster ${CLUSTER_NAME} \
	--zones europe-west1-b \
	--master-count 3 \
	--state ${KOPS_STATE_STORE} \
	--project=${PROJECT} \
	--node-count=5 \
	--node-size=n1-standard-4

kops get cluster --state ${KOPS_STATE_STORE} ${CLUSTER_NAME} -oyaml

kops update cluster --state ${KOPS_STATE_STORE} ${CLUSTER_NAME} --yes
