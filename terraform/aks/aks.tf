
provider "azurerm" {
	version = "~>1.5"
}

provider "random" {
  version = "~> 2.0"
}

resource "azuread_application" "current" {
  name = "default"
}

resource "azuread_service_principal" "current" {
  application_id = "${azuread_application.current.application_id}"
}

resource "random_string" "password" {
  length  = 64
  special = true
}

resource "azuread_service_principal_password" "current" {
  service_principal_id = "${azuread_service_principal.current.id}"
  value                = "${random_string.password.result}"
  end_date_relative    = "2160h"                                   # valid for 90 days
}

resource "azurerm_resource_group" "weaviate-k8s" {
  name     = "${var.aks_resource_group_name}"
  location = "${var.aks_location}"
}

resource "azurerm_kubernetes_cluster" "weaviate-k8s" {
  name                = "${var.cluster_name}"
  location            = "${azurerm_resource_group.weaviate-k8s.location}"
  resource_group_name = "${azurerm_resource_group.weaviate-k8s.name}"
  dns_prefix          = "${var.aks_dns_prefix}"

  linux_profile {
    admin_username = "ubuntu"

    ssh_key {
      key_data = "${file("${var.ssh_public_key}")}"
    }
  }

  agent_pool_profile {
    name            = "default"
    count           = "${var.aks_cluster_size}"
    vm_size         = "${var.aks_vm_size}"
    os_type         = "${var.aks_os_type}"
    os_disk_size_gb = "${var.aks_disk_size}"
  }

  service_principal {
    client_id     = "${azuread_application.current.application_id}"
    client_secret = "${azuread_service_principal_password.current.value}"
  }

  tags = {
    Environment = "Production"
  }
}

## Used for debugging only 

output "client_certificate" {
  value = "${azurerm_kubernetes_cluster.weaviate-k8s.kube_config.0.client_certificate}"
}

output "kube_config" {
  value = "${azurerm_kubernetes_cluster.weaviate-k8s.kube_config_raw}"
}
