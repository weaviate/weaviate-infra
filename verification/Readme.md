# Verification script to check business cases of deployed weaviate instance

## Roadmap / Todos

* [x] get terms from contextionary (can be hardcoded at first)
* [ ] generate fixed number of actions in ontology
* [x] generate fixed number of things in ontology
* [ ] add random property types to things and actions
* [ ] generate fixed number of vertices with simple properties (string, bool, etc.)
* [ ] add reference properties to vertices
* [ ] submit ontology to weaviate via REST API
* [ ] submit verticies to weaviate via REST API
* [ ] add validity checks (store created verticies in memory, query weaviate to see if
  we get the expected results back)
* [ ] replace fixed numbers with dynamic values provided through CLI args
* [ ] make weaviate discevery URL/origin configurable
* [ ] dockerize script (so no one is annoyed by the babeling required for flowtypes)
* [ ] run on travis

## FAQ

### Why is this written in NodeJS and not Golang like most of our code?

To catch two birds with one stone, we wanted to deviate from our main tech stack 
with this script to make sure we are forced to generate more REST API clients for
other languages as well. NodeJS was a personal choice of @etiennedi, due to his 
familiarity with the language.
