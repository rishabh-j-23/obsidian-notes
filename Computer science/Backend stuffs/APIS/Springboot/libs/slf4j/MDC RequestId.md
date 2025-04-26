- used for [[Debugging]]
- Same request id is passed to all logs of [[slf4j]] 
- you can do a [[grep]] to get the log related to those ids which makes it easier to debug in the large logs contents

> Request id is same only for same [[ThreadContext]]
> For multithread or [[Aync]]/[[CompletableFuture]] calls:
>	- create a wrapper for the [[Runnable]] task which copies the existing [[ThreadContextMap]] and runs the task
