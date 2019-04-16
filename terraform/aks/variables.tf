variable "cluster_name" {
	description = "name of kubernetes cluster"
	default = "weaviate"
}

variable "node_disk_size" {
  description = "Node disk size in GB"
  default = "124"
}

variable "aks_resource_group_name" {
	default = "weaviateRG1"
}

variable "aks_location" {
	default = "East US"
}

variable "aks_cluster_size" {
	default = "3"
}

variable "aks_vm_size" {
	default = "Standard_D4_v2"
}

variable "aks_os_type" {
	default = "Linux"
}

variable "aks_disk_size" {
	default ="30"
}

variable "aks_dns_prefix" {
	default = "weaviateagent"
}

#variable "aks_client_id" {
#}

#variable "aks_client_secret" {
#}

variable "ssh_public_key" {
	default = "~/.ssh/id_rsa.pub"
}