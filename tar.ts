import {
    createTar,
    createTarGzip,
    createTarGzipStream,
    parseTar,
    parseTarGzip,
  } from "nanotar";

  const data = await createTar(
    [
      { name: "README.md", data: "# Hello World!" },
      { name: "test", attrs: { mode: "777", mtime: 0 } },
      { name: "src/index.js", data: "console.log('wow!')" },
    ],
    { attrs: { user: "js", group: "js" } },
  );

  console.log(data);
  