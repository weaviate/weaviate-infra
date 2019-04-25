# Setup for Azure

## Requirements

- Azure cloud account - https://azure.microsoft.com/
- Azure CLI - https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest

The default cluster setup uses 5 Standard_D4_v2 instances. This is not valid under an Azure free tier account (you will receive an error regarding QuotaExceeded when attempting to apply the terraform). So you will need to either use a pay-as-you-go Azure account or adjust the cluster size and instances in the variables.tf file.

### Authentication with Azure

Use the Azure CLI to authenticate with Azure.

```
az login
```

You will need to create (or use an existing) subscription. The subscription ID can be obtained from the UI or by using `az account list`

Next, you will specifiy the subscription to use:

```
az account set --subscription="SUBSCRIPTION_ID"
```

### Creating the Cluster

You can modify any variables (e.g. cluster location, cluster size) in the [variables.tf](./variables.tf) file.

```
terraform init # Only needs to be run once
```

```
terraform plan
```

```
terraform apply  # approve with 'yes'
``` 

If the terraform apply fails (with permissions issue, re-apply)

### Connecting to the Cluster

```
echo "$(terraform output kube_config)" > azurek8s
```

```
kubectl --kubeconfig=azurek8s cluster-info
```

You can either replace your existing kubeconfig with the new generated one or merge your kubeconfigs.

## Next up

[Deploy weaviate onto new cluster](../../README.md)

### Destroying cluser

```
terraform destroy
```
