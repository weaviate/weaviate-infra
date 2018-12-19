variable "gke_project" {
	description = "name of google project to use"
	default = "semi-186012"
}
variable "cluster_name" {
	description = "name of kubernetes cluster"
	default = "weaviate"
}

variable "gke_cluster_zone" {
	description = "in which google zone to setup the cluster"
	default = "europe-west1-b"
}

variable "initial_node_count" {
	description = "the intial number of nodes in the cluster"
	default = "5"
}

variable "min_nodes" {
	description = "minimum number of nodes to have in cluster"
	default = "2"
}

variable "max_nodes" {
	description = "maximum number of nodes when autoscaling cluster"
	default = "10"
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
	default = "europe-west1"
}