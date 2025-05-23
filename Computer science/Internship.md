# Bytemonk
- Aspects and Annotations
- Alert system
    - round robbing db
    - time series db
- data aggregation libs
    - apache flink
    - databricks
    - kafka > KSQL DB

## TODO:
- server
    - [ ] cloud api rate limits
    - [x] change redirect uri
        - [x] google => google console -> APi and services -> credentails -> oauth client ids -> select app -> change uri
        - [x] O365 => azure protal -> app registrations -> select app -> authentication -> change redirect uri
    - [ ] Deployment of alert classification service
        - [ ] check if alerts are working
        - [x] create workflow
        - [x] create .service file
        - [x] test the deployment 
            - [x] venv folder deleting whenever each llm app runs
    - [ ] Fix gmail and outlook landing pages 
        - [x] return html
        - [ ] gmail was using old api url
        - [ ] html not implemented due to this
        - [ ] cannot test O365 -> needs work or school account
    - [ ] Implement mark false positive in violation actions
    - [x] implement ttl indexes
    - [x] remainder about not being able to post in private channel on slack
        - [x] not to select on channel which has slack bot already running on
    - [x] write test cases for alert system
    - [x] violation sensitive data in matching text should be hidden
        - [x] server -> hide using unmask flag
    - [x] user management
        - [x] user groups arent getting applied
              
- ui
    - [ ] violation chart suspected action
        - [ ] ui -> should be label instead of name
    - [ ] data lineage -> unrelated data selected
    - [ ] violation sensitive data in matching text should be hidden
        - [ ] ui -> unmask box -> both matching text and surrounding text


- "https://www.googleapis.com/auth/admin.directory.user.readonly"
- "https://www.googleapis.com/auth/admin.directory.orgunit"
- "https://www.googleapis.com/auth/gmail.readonly"
- "https://mail.google.com/"
- "https://www.googleapis.com/auth/admin.directory.customer.readonly"
- "https://www.googleapis.com/auth/drive"
        scopes.add("https://www.googleapis.com/auth/appsmarketplace.license");
        scopes.add("https://www.googleapis.com/auth/userinfo.profile");
        scopes.add("https://www.googleapis.com/auth/userinfo.email");
        scopes.add("https://www.googleapis.com/auth/admin.directory.user.security");
