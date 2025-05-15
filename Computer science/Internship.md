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
    - [ ] Implement mark false positive in violation actions
    - [ ] implement ttl indexes
    - [x] remainder about not being able to post in private channel on slack
        - [ ] not to select on channel which has slack bot already running on
    - [x] write test cases
    - [ ] user group detections data not coming on ui and cloud
        - [ ] issue is probably everything is email based
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
