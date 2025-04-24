- Type of [[Semaphore]]
- binary in nature
- used for locking
- uses method `wait()` and ``signal()`

```c
wait() {
	while (lock == true);
}

signal() {
	lock = false;
}
```
