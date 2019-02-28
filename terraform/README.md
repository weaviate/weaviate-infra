# Setup Kubernetes Cluster on GKE with Terraform

## Pre-reqs

* Terraform (https://www.terraform.io/)
* gcloud cli (https://cloud.google.com/sdk/gcloud/)


## Create Service Account

* Go to Google Cloud Console - https://console.cloud.google.com
* Select a project
* From menu top left select 'APIs & Services' -> 'Credentials'
* Select 'Create credentials' -> 'Service account key'
* Create service account
	* Name - Terraform admin account
	* Select appropirate roles (Project Owner)
	* Key type => JSON
* Save generated json key locally
* Copy download file to ./semi-weaviate-infra.json

(Alternatively this can be done with gcloud cli: https://cloud.google.com/community/tutorials/managing-gcp-projects-with-terraform)

## Choosing back end

Cassandra or BigTable

BigTable is deployed along with the GKE cluster. This can be controlled via the `enable_big_table` variable. Either modify directly via ./variables.tf or by setting an env var `TR_VAR_enable_big_table`

## Create cluster

```
$ terraform init
$ terraform plan
$ terraform apply
```


## Configure kubectl

[...install and configure gcloud]

```
$ gcloud container clusters get-credentials weaviate
```

## Next up

Deploy weaviate onto new cluster ../README.md

