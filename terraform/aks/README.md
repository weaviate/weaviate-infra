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

If the terraform apply fails (with permissions issue, re-apply)

### Connecting to the Cluster

```
echo "$(terraform output kube_config)" > azurek8s
```

```
kubectl --kubeconfig=azurek8s cluster-info
```

You can either replace your existing kubeconfig with the new generated one or merge your kubeconfigs:

```
export KUBECONFIG=~/.kube/config:[PATH_TO_azurek8s]
kubectl config view --flatten > ~/.kube/mergedkub && mv ~/.kube/mergedkub ~/.kube/config
```
## Next up

[Deploy weaviate onto new cluster](../../README.md)

### Destroying cluser

```
terraform destroy
```
