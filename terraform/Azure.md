# Setup for Azure

Install the Azure CLI - https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest


### Retrieve Azure connection credentials

```
$ az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/[YOUR SUBSCRIPTION ID]"
```

Export the following variables (based on the output of previous command)

```
export ARM_SUBSCRIPTION_ID=xxxxxxxx
export ARM_CLIENT_ID=xxxxxxx
export ARM_CLIENT_SECRET=xxxxxxx
export ARM_TENANT_ID=xxxxxxxx
```

Export Terraform Specific Variables

```
export TF_VAR_aks_client_id=${ARM_CLIENT_ID}
export TF_VAR_aks_client_secret=${ARM_CLIENT_SECRET}
```

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
