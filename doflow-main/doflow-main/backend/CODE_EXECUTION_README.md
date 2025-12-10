# Code Execution Service

## Overview
Real-time Python code execution service with built-in security measures and test case validation.

## Features
- ✅ Execute Python code in real-time
- ✅ Syntax validation
- ✅ Automated test case validation
- ✅ Security measures (timeout, output limits)
- ✅ Input/Output handling
- ✅ Execution time tracking

## Security Measures

### 1. **Execution Timeout**
- Maximum execution time: 5 seconds
- Prevents infinite loops and hanging processes

### 2. **Output Size Limit**
- Maximum output size: 1MB
- Prevents memory exhaustion attacks

### 3. **Isolated Execution**
- Code runs in temporary files that are immediately deleted
- Each execution gets a unique UUID-based filename

### 4. **Authentication Required**
- All endpoints require valid JWT authentication
- User must be logged in to execute code

## API Endpoints

### Execute Code
```
POST /api/code/execute
Authorization: Bearer <token>

Body:
{
  "code": "print('Hello World')",
  "language": "python",
  "input": "" // optional stdin input
}

Response:
{
  "success": true,
  "output": "Hello World",
  "error": "",
  "executionTime": 45
}
```

### Validate Code
```
POST /api/code/validate
Authorization: Bearer <token>

Body:
{
  "code": "print('Hello')",
  "language": "python"
}

Response:
{
  "success": true,
  "valid": true,
  "error": null
}
```

## Usage in Frontend

### Running Code
Students can click "Run" to execute their code and see output immediately.

### Submitting Solutions
Students can click "Submit" to run their code against predefined test cases:
- Each test case has input and expected output
- Code is executed for each test case
- Results show which tests passed/failed
- Lesson is marked complete when all tests pass

## Test Case Format

Test cases are stored in lesson content:
```json
{
  "testCases": [
    {
      "input": "5",
      "output": "120"
    },
    {
      "input": "3",
      "output": "6"
    }
  ]
}
```

## Error Handling

### Syntax Errors
```
SyntaxError: invalid syntax
  File "temp.py", line 2
```

### Runtime Errors
```
ZeroDivisionError: division by zero
  File "temp.py", line 5
```

### Timeout
```
Execution timeout: Code took too long to execute (5s max)
```

### Output Limit
```
Output size limit exceeded (1MB max)
```

## Future Enhancements

### Planned Features
- [ ] Support for more languages (JavaScript, Java, C++)
- [ ] Docker containerization for better isolation
- [ ] Memory usage tracking
- [ ] Code plagiarism detection
- [ ] Performance benchmarking
- [ ] Custom time/memory limits per problem

### Security Improvements
- [ ] Sandboxed execution environment
- [ ] Network access restrictions
- [ ] File system isolation
- [ ] Resource usage monitoring

## Dependencies

### Backend
- Node.js with `child_process` module
- Python 3.x installed on server

### Frontend
- axios for API calls
- monaco-editor for code editing
- react-hot-toast for notifications

## Installation

1. Ensure Python is installed:
```bash
python --version
```

2. Backend will automatically create temp directory for code execution

3. Temp files are automatically cleaned up after execution

## Monitoring

### Check Service Health
```bash
GET /api/health
```

### Monitor Logs
Server logs include:
- Code execution requests
- Execution times
- Errors and failures
- Timeout events

## Troubleshooting

### Python Not Found
Ensure Python is in system PATH and accessible from Node.js

### Permission Errors
Ensure backend has write permissions for temp directory

### Timeout Issues
Check if Python installation is slow or if code has infinite loops

### Output Not Displaying
Verify frontend is correctly calling the API and handling responses
