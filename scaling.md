# Scaling

Goal: to document how the various pieces should be scaled.

All non weaviate components (Cassandra, Elasticsearch, JanusGraph) should be scaled manually. Dynamically scaling datastores is generally not recommended. 

You can manually scale each component with the following Helm commands, or simply update the `values.yaml` file and run: 

```
$ helm upgrade -f weaviate/values.yaml weaviate weaviate
```

## Cassandra

```
helm upgrade --set cassandra.config.cluster_size=5 weaviate ./weaviate
```

## JanusGraph:

```
helm upgrade --set janusgraph.replicaCount=X weaviate ./weaviate
```

## Elasticsearch

```
helm upgrade --set elasticsearch.client.replicas=X weaviate ./weaviate
```

## Weaviate

Weaviate can be autoscaled based on CPU. To enable autoscaling, when deploying modify the `autoscaling.enabled` variable here [values.yaml](./helm/values.yaml)

### GKE (Hosted Kubernetes)

If using the included [GKE setup](./teraform/README.md) cluster autoscaling is enabled by default.