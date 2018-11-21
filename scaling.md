# Scaling

Goal: to document how the various pieces should be scaled.

All non weaviate components (Cassandra, Elasticsearch, JanusGraph) should be scaled manually. Dynamically scaling datastores is generally not recommended. 

## Cassandra

```
helm upgrade --set config.cluster_size=5 cassandra incubator/cassandra
```

## JanusGraph:

```
helm upgrade --set replicaCount=X janus stable/janusgraph
```

## Elasticsearch

```
helm upgrade --set client.replicas=X elasticsearch stable/elasticsearch
```

## Weaviate

Weaviate can be autoscaled based on CPU. To enable autoscaling, when deploying modify the `autoscaling.enabled` variable here [values.yaml](./helm/values.yaml)

### GKE (Hosted Kubernetes)

If using the included [GKE setup](./teraform/README.md) cluster autoscaling is enabled by default.