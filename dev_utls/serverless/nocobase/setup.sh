#!/bin/bash

if [ -z "$FC_ACCOUNT" ]
then
  echo "Argument account is required but not provided. Usage: $0 account ID;"
  exit 1
fi

if [ -z "$region" ]
then
  echo "Argument region is required but not provided. Usage: $1 region;"
  exit 1
fi

if [ -z "$CONTAINER_PORT" ]
then
  echo "Argument CONTAINER_PORT is required but not provided. Usage: $2 CONTAINER_PORT;"
  exit 1
fi

if [ -z "$IMAGE_NAMESPACE" ]
then
  echo "Argument IMAGE_NAMESPACE is required but not provided. Usage: $3 IMAGE_NAMESPACE;"
  exit 1
fi

if [ -z "$IMAGE_NAME" ]
then
  echo "Argument IMAGE_NAME is required but not provided. Usage: $4 IMAGE_NAME;"
  exit 1
fi

perl -i -p -e 's/{FC_ACCOUNT}/$ENV{"FC_ACCOUNT"}/g' s.yaml
perl -i -p -e 's/{region}/$ENV{"region"}/g' s.yaml
perl -i -p -e 's/{CONTAINER_PORT}/$ENV{"CONTAINER_PORT"}/g' s.yaml
perl -i -p -e 's/{IMAGE_NAMESPACE}/$ENV{"IMAGE_NAMESPACE"}/g' s.yaml
perl -i -p -e 's/{IMAGE_NAME}/$ENV{"IMAGE_NAME"}/g' s.yaml