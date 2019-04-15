provider "google" {
  credentials = "${file("semi-weaviate-infra.json")}"
  project     = "${var.gke_project}"
  region      = "${var.gcp_region}"
}

resource "google_container_cluster" "primary" {
  name               = "${var.cluster_name}"
  description        = "Kubernetes Cluster on GKE for Weaviate platform."
  zone               = "${var.gke_cluster_zone}"
  project			       = "${var.gke_project}"
  min_master_version = "1.12"

  remove_default_node_pool = true
  node_pool {
    name = "default-pool"
  }
}


resource "google_container_node_pool" "primary_pool" {
  name       = "primary-pool"
  cluster    = "${google_container_cluster.primary.name}"
  zone       = "${var.gke_cluster_zone}"
  initial_node_count = "${var.initial_node_count}"

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
    machine_type = "${var.gke_machine_type}"
    disk_size_gb = "${var.node_disk_size}"
    preemptible  = true
    tags = ["weaviate"]
  }

  autoscaling {
    min_node_count = "${var.min_nodes}"
    max_node_count = "${var.max_nodes}"
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# The following outputs allow authentication and connectivity to the GKE Cluster.
# Useful for debugging, can be removed
# output "client_certificate" {
#   value = "${google_container_cluster.primary.master_auth.0.client_certificate}"
# }
# 
# output "client_key" {
#   value = "${google_container_cluster.primary.master_auth.0.client_key}"
# }
# 
# output "cluster_ca_certificate" {
#   value = "${google_container_cluster.primary.master_auth.0.cluster_ca_certificate}"
# }
