Functional requirements
- Store requests => IMP -> figure this out
    - eg, for key login-rishabh => the equivalent request json will be stored
    - utilize cookies
- show time taken to execute and request details
- use $EDITOR to add or edit request json schema
- use `fzf` to navigate through requests
- request data read anytime
    - table for simpler data
- manage environment
- create workflow
    - eg: set login to exec before every req in env
    - should show time for original request not the combined request
- Define cookies?

What to use
- Go
    - Go's built in http lib
    - cobra module?
- fzf
- $EDITOR
- **json based storage of requests locally? -> IMP**
- 