---
layout: default
title: '"doc"'
nav_order: 13
description: 监控
parent: middleware
has_children: false
permalink: "/middleware/monitoring/monitoring/"
---

# 监控

## alarm-settings.yml

```yml

hooks:
  dingtalk:
    default:
      is-default: true
      text-template: |-
        {
          "msgtype": "text",
          "text": {
            "content": "Apache SkyWalking Alarm: \n %s."
          }
        }      
      webhooks:
      - url: https://oapi.dingtalk.com/robot/send?access_token=38c949c7aeff071e2065e81e58a82cdaf54290eae442cd11468b82fd6633fc8d


```
