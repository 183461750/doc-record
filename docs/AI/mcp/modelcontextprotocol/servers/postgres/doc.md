# postgres使用记录

[官方文档](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)

- docker方式

```bash
{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": [
        "run", 
        "-i", 
        "--rm", 
        "mcp/postgres", 
        "postgresql://host.docker.internal:5432/mydb"]
    }
  }
}
```
