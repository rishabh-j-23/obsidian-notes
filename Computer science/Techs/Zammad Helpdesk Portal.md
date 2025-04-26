###### Basic Setup:
1. Needs
	- Create Organization
	- Agent -> responds to ticket
	- Customer -> create tickets
	- Admin -> manages how everything is handled 
		- ticket and user creation 
		- allocation to which ticket goes to whom
2. Give agent role permission to access a group
	- Roles -> Agent -> Group permissions
3. Create Trigger to auto assign a ticket to user group
4. Select a group on which tickets are auto assigned
	- Admin -> Channels -> Web -> Group selection for Ticket creation

###### To Find:
1. How to disable group selection on customer side during ticket creation in case of multiple groups
2. Auto assign a ticket to an agent
3. How to assign user to an organization automatically 

###### To Fix:
1. Email verification emails not being sent
2. Login issues
	- CSRF token verification failed

###### Read More about:
1. Conditions used during auto assignment and triggers
2. Groups perms to a role and user

###### Issues Faced:
- Groups were not being assigned to a role
	- After few tries groups were assigned
		- Reason: unknown
- Cannot see the tickets on agent after changing groups