# Verification script to check business cases of deployed weaviate instance

## Roadmap / Todos

* [x] get terms from contextionary (can be hardcoded at first)
* [x] add support for actions (should be identical to things)
  * [x] generate action classes
  * [x] submit action classes
  * [x] generate action vertices
  * [x] submit action vertices
  * [x] add-cross-refs to ontolgy
  * [x] submit cross-refs to ontology
  * [x] populate cross-refs (things for thing/actions for actions)
  * [x] submit cross-refs 
* [x] generate fixed number of things in ontology
* [x] add random primitive property types to things ~~and actions~~ (no relations)
* [x] generate fixed number of vertices matching the previously created ontology (no relations) 
  * [x] create a single thing with a single property
  * [x] create a single thing with many properties
  * [x] randomize property values
  * [x] create x amount of things
  * [x] include types other than number, string, boolean: int, date
* [x] add reference properties to vertices
  * [x] make individual thing verticies referencable through uuids
  * [x] add 1 cross-reference to 1 other thing class 
  * [x] add n cross-references (make sure we don't reference ourselves!)
  * [x] populate by randomly picking from thing that matches referenced class
* [x] submit ontology to weaviate via REST API
  * [x] submit things without cross-references
  * [x] submit cross-references
* [x] submit verticies to weaviate via REST API
  * [x] without cross-refs
  * [x] populate cross-refs
* [x] add validity checks (store created verticies in memory, query weaviate to see if
  we get the expected results back)
* [x] replace fixed numbers with dynamic values provided through CLI args
* [x] make weaviate discovery URL/origin configurable
* [x] dockerize script (so no one is annoyed by the babeling required for flowtypes)

## Known Limitations

### Only one `@dataType` supported
There are two cases for dataType:

1. A primitive type. In this case `@dataType` is always an array of length 1
2. A cross-references. In this case the length can be longer than 1

However, the script currently only ever takes the first element of the array. 
This was intentional to speed up development and should be reasonably easy to fix down the line.

## FAQ

### Why is this written in NodeJS and not Golang like most of our code?

To catch two birds with one stone, we wanted to deviate from our main tech stack 
with this script to make sure we are forced to generate more REST API clients for
other languages as well. NodeJS was a personal choice of @etiennedi, due to his 
familiarity with the language.
