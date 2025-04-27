---
tags:
    - networking
---

- Following columns
	- Network (type: [[IP Address]])
	- Next Hop (type: [[IP Address]])
	- Link (type: [[Boolean]]) -> direct link 
		- how direct? -> how already have a [[Network Interface]]
	- Weight (type: )
	- NIC (type: [[Network Interface]])

##### Commands:
- netstat -rn
- ip route show

##### Who updates Routing table?
- [[Kernel]]
- [[Network Protocols]]
	- [[DHCP]]
	- [[OSPF]]
	- [[BGP]]
