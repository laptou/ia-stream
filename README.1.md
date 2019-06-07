# `ia-stream`

Streams in Node.js don't have the ability to seek; and you can only read the data in them once. This is majorly inconvient for operations like random access to a file.

The obvious solution is to just use `fs` methods directly, but this isn't ideal either — what if you need an abstraction where the data behind the stream can come from a place other than a file?

This package provides streams that are modeled after [`Stream`s](https://docs.microsoft.com/en-us/dotnet/api/system.io.stream?view=netframework-4.8) in .NET, allowing random access / seeking, reading data more than once, and providing a `Promise`-based API.

# API

hmm

---

© 2019 Ibiyemi Abiodun (laptou) \<ibiyemi.a.abiodun@gmail.com\>