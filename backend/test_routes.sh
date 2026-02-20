#!/bin/bash

echo "Testing Backend Routes..."
echo "========================="

# Test 1: Login
echo -e "\n1. Testing /auth/login"
curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.com","password":"admin123"}' | jq .

# Get token for further tests
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.com","password":"admin123"}' | jq -r .access_token)

echo -e "\nToken: $TOKEN"

# Test 2: Get leave types
echo -e "\n2. Testing /leaves/types"
curl -s -X GET http://localhost:5000/leaves/types \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 3: Get employees
echo -e "\n3. Testing /leaves/employees"
curl -s -X GET http://localhost:5000/leaves/employees \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 4: Get pending leaves
echo -e "\n4. Testing /leaves/pending"
curl -s -X GET http://localhost:5000/leaves/pending \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n========================="
echo "Tests completed!"
