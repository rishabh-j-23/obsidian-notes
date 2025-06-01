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


Google scopes used:
- Gsuite:
    - ./auth/activity => couldnt find this scope
- Google OAuth2 API, v2
    - https://www.googleapis.com/auth/userinfo.profile 
        - Needed
        - See your personal info, including any personal info you've made publicly available
    - https://www.googleapis.com/auth/userinfo.email 
        - Needed
        - See your primary Google Account email address

- Admin SDK => No usage details on cloud console
    - https://www.googleapis.com/auth/admin.reports.audit.readonly	
        - View audit reports for your G Suite domain
        - Probably not needed
    - https://www.googleapis.com/auth/admin.reports.usage.readonly	
        - View usage reports for your G Suite domain
        - Probably not needed
    - https://www.googleapis.com/auth/admin.directory.user.security 
        - Manage data access permissions for users on your domain
        - Probably not needed
    - https://www.googleapis.com/auth/admin.directory.domain.readonly" 
        - View and manage the provisioning of domains for your customers
        - Probably not needed
    - https://www.googleapis.com/auth/admin.directory.user.readonly" 
        - View and manage the provisioning of users on your domain
    - https://www.googleapis.com/auth/admin.directory.customer.readonly" 
        - View and manage the provisioning of users on your domain

- Drive Api
    - https://www.googleapis.com/auth/drive.metadata.readonly"
        - Needed
    - https://www.googleapis.com/auth/drive.readonly
        - Needed
    - https://www.googleapis.com/auth/drive.scripts	
        - Modify your Google Apps Script scripts' behavior 
        - not needed
        - Apps Script is a cloud-based JavaScript platform powered by Google Drive that lets you integrate with and automate tasks across Google products.
    - https://www.googleapis.com/auth/drive
        - See, edit, create, and delete all of your Google Drive files
        - very Sensitive probably not needed since read only is being used
    - https://www.googleapis.com/auth/drive.metadata
        - View and manage metadata of files in your Google Drive
        - Probably not needed since we are using the metadata.readonly
![[Pasted image 20250524093429.png]]

- Gmail API
    - https://www.googleapis.com/auth/gmail.readonly"
        - Needed
    - https://mail.google.com/"
        - very sensitive
        - probably not needed since we are not deleting the emails
        - Read, compose, send, and permanently delete all your email from Gmail
    - https://www.googleapis.com/auth/gmail.settings.basic	
        - See, edit, create, or change your email settings and filters in Gmail
    - https://www.googleapis.com/auth/gmail.settings.sharing	
        - Manage your sensitive mail settings, including who can manage your mail
        - This im not sure
![[Pasted image 20250524092956.png]]
