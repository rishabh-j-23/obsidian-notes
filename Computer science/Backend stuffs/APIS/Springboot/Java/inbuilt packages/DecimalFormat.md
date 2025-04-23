- used to format the double or float number
```java
DecimalFormat df = new DecimalFormat(<pattern>)
```
- `<pattern>`	
	- \# -> only integer part of the [[Floating number]]
			- eg 1.2323 -> 1
	- #.## -> converts [[Floating number]] upto 2 decimal places
		- eg: 1.2323 -> 1.23