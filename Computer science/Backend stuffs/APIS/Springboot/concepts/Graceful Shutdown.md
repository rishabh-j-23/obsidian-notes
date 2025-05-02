---
tags:
  - springboot-concepts
---
- When the [[Server]] is running and due to any reason we have to redeploy the request which have already arrived on the server needs to be handled
- this requests are handled by the `Graceful Shutdown`

## Graceful shutdown
- it is a process in which server stops accepting the requests 
- It allows processing the requests already present on the server.
    - this could be [[REST API]] requests
    - [[Spring Schedulers]]
    - and other tasks

## Causes of graceful shutdown failures
- the [[jar file]] file in case of [[Spring boot]] was already removed/replaced
    - this causes the server to fetch resources from the [[jar file]] which has changed and not recognized by already running jar file

> [!question]
> need to find causes of this behaviour
