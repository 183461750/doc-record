#!/bin/bash
user=xxx
passwd=***

sleep 5
/usr/bin/influx <<EOF
create database prometheus;
exit
EOF