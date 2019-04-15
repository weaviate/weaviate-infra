# Setup for Azure

## Requirements

- Azure cloud account - https://azure.microsoft.com/
- Azure CLI - https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest

### Creating the Cluster

```
terraform init
terraform plan
terraform apply
```


### Connecting to the Cluster

```
echo "$(terraform output kube_config)" > azurek8s
```

```
kubectl --kubeconfig=azurek8s cluster-info
```

### Destroying cluser

```
terraform destroy
```
