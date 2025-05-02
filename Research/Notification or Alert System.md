---
tags:
  - research
---
#### Alerts Table


--- start-multi-column: ID_kwxo
```column-settings
Number of Columns: 2
Largest Column: standard
```
`alerts` table

| Key | Columns        |            type            |
| --- | :------------- | :------------------------: |
| PK  | id             |           bigint           |
| FK  | orgId          |           bigint           |
| FK  | template_id    |             id             |
|     | description    |            text            |
|     | severity       |            enum            |
|     | meta           |            json            |
|     | ttl            |         timestamp          |
|     | status         | enum(READ, RECEIVED, SENT) |
|     | classification |          varchar           |
 

--- column-break ---

`alert_template` table

| Key | Columns          |  types  | details                                               |
| --- | ---------------- | :-----: | ----------------------------------------------------- |
| PK  | id               | bigint  |                                                       |
|     | type             |  enum   |                                                       |
|     | title            | varchar |                                                       |
|     | integration_type |  enum   |                                                       |
|     | data             |  json   | different data schema for different integration types |


--- end-multi-column

- create a template for predefined types of alerts

problems
- link to violation
- metadata
    - what caused alert

- default template
- each org level template

alert_template -> currently not suitable for multiple channels
- integration-type

violiation -> python alert processing -> server call python api -> queue -> alerts
- data loss check
- Notification settings?
    - template 

![[alert system digrams.svg]]