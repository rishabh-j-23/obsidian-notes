---
aliases:
---
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
3. Create Trigger to auto assign a ticket to a certain group
4. Select a group on which tickets are auto assigned
	- Admin -> Channels -> Web -> Group selection for Ticket creation
5. use `Triggers` to implement complex conditions as well as to send notifications

###### To Find:
1. ~~How to disable group selection on customer side during ticket  creation  in case of multiple  groups~~ 
2. ~~Auto assign a ticket to an agent~~
    - only viable way is when a ticket is created, 
        - if agent opens that ticket and  org == customer org then
            - the agent is assigned that ticket via `Admin -> Settings -> Ticket -> Auto-assignment`
        - else ticket remains unassigned
3. How to assign user to an organization automatically 
	1. Try with domain based organization creation?
    	2. caused [To Fix issue 1](#To Fix:)
4. Add a default message on issue create
5. Give open for only `new` issues
6. Email setup
7. Email Trigger.
    - User registration/
    - Ticket change.
8. MFA option.
9. Status as mentioned
    - Ticket Status need be set to following
        - Open
        - In Progress.
        - Resolved
        - Closed
        - Invalid
        - Needs More Info
10. Auto assignment.
11. escalation options?
12. One primary - duplicate option - How to mark a ticket as duplicate of another ticket.
13. Dashboard.
    1. Create Profile in `Report Profiles`

###### To Fix:
1. Email verification emails not being sent
2. Login issues
	- CSRF token verification failed

###### Read More about:
1. Conditions used during auto assignment and triggers
2. Groups perms to a role and user

###### Issues Faced:
- ~~Groups were not being assigned to a role~~
	- ~~After few tries groups were assigned~~
		- ~~Reason: unknown~~
	- Solved -> skill issue, need to click add button to add the new setting
- ~~Cannot see the tickets on agent after changing groups~~
	- had to change default ticket assignment group [Basic-Setup](#Basic Setup) -> 4th point


TODO:
