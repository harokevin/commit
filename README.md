# Installing

1. Install TypeScript

```bash
npm install -g typescript
```

1. Install dependencies
```bash
npm install
```

1. Build the server and client scripts
```bash
tsc -p ./src/server
tsc -p ./src/client
```

1. Start it
```bash
npm run start
```

7. Visit
[http://127.0.0.1:3000/](http://127.0.0.1:3000/)


---

## Notes

1. After opening the project in VSCode, open the file `client.ts`. If VSCode is showing red squigly's under the **import** paths, then press F1, then select 'Restart TS Server'


2. While running `npm run dev`, any edits to the `client/client.ts` or `server/server.ts` you make will be auto recompiled and you should refresh your browser to see the changes.


