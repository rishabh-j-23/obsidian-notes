# `@JsonIgnoreProperties(ignoreUnknown  = true)`

- Ignores the unknown properties 
- When used in [[REST API]], it ignores the fields received in json request body
	- Very useful when dealing with external APIs since we always dont need the complete request body


---
# `@JsonInclude`

## `@JsonInclude(Json.Include.NON_NULL)`

- ignores the null fields when sending a response from the server

---
# `@JsonProperty`
## `name = "<property-name>`

- maps a property to a json equivalent
eg:
```java
@JsonProperty("user_id")
private String userId;
```
- Maps the user_id property to userId and vice versa when sending and receiving the json object over [[RestController]]
