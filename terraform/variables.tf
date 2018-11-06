variable "gke_project" {
	description = "name of google project to use"
	default = "semi-weaviate-infra"
}
variable "cluster_name" {
	description = "name of kubernetes cluster"
	default = "weaviate"
}

variable "gke_cluster_zone" {
	description = "in which google zone to setup the cluster"
	default = "us-east1-b"
}

variable "node_count" {
	description = "number of initial nodes in the cluster"
	default = "5"
}

variable "node_disk_size" {
  description = "Node disk size in GB"
  default = "20"
}

variable "gke_machine_type" {
	description = "google machine instance type of each node"
	default = "n1-standard-4"
}

variable "gcp_region" {
	default = "us-east1"
}