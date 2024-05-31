#!/bin/bash

# Loop through each file in the k8s directory
for file in k8s/*; do
  # Check if it's a regular file
  if [ -f "$file" ]; then
    # Perform envsubst and apply with kubectl
    envsubst < "$file" | kubectl apply -f -
  fi
done

