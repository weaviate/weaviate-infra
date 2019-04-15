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

