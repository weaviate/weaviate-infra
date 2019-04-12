
provider "azurerm" {
	version = "=1.5.0"	
}

resource "azurerm_resource_group" "weaviate-k8s" {
  name     = "${var.aks_resource_group_name}"
  location = "${var.aks_location}"
}

resource "azurerm_kubernetes_cluster" "weaviate-k8s" {
  name                = "${var.aks_cluster_name}"
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
    vm_size         = "Standard_D1_v2"
    os_type         = "Linux"
    os_disk_size_gb = 30
  }

  service_principal {
    client_id     = "${var.aks_client_id}"
    client_secret = "${var.aks_client_secret}"
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
