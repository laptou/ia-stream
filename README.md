# `ia-stream`

Streams in Node.js don't have the ability to seek; and you can only read the data in them once. This is majorly inconvient for operations like random access to a file.

The obvious solution is to just use `fs` methods directly, but this isn't ideal either — what if you need an abstraction where the data behind the stream can come from a place other than a file?

This package provides streams that are modeled after [`Stream`s](https://docs.microsoft.com/en-us/dotnet/api/system.io.stream?view=netframework-4.8) in .NET, allowing random access / seeking, reading data more than once, and providing a `Promise`-based API.

# API
Docs generated using [`docts`](https://github.com/charto/docts)
>
> <a name="api-FileStream"></a>
> ### Class [`FileStream`](#api-FileStream)
> Source code: [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L15-L217)  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[FileStream](#api-FileStream)</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L23-L39)  
> > &emsp;&#x25aa; fd <sup><code>FileHandle</code></sup>  
> > &emsp;&#x25aa; options <sup><code>FileStreamOptions</code></sup>  
> > **.seek( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L113-L125)  
> > &emsp;<em>Changes the position of the next read in the stream.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup>  
> > **.read( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L127-L147)  
> > &emsp;<em>Reads some bytes from the stream.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup>  
> > **.readFrom( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L149-L155)  
> > &emsp;<em>Combines `seek` and `read`.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup>  
> > **.write( )** <sup>&rArr; <code>Promise&lt;number&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L157-L170)  
> > &emsp;<em>Writes some data to the stream.</em>  
> > &emsp;&#x25aa; data <sup><code>Buffer</code></sup>  
> > **.resize( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L172-L183)  
> > &emsp;<em>Resizes the source of this stream to a given number of bytes. Streams that </em>  
> > &emsp;<em>cannot be written to cannot be resized.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > **.close( )** <sup>&rArr; <code>Promise&lt;void&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L185-L192)  
> > &emsp;<em>Closes this stream. Once it is closed, any underlying resources (memory buffers,</em>  
> > &emsp;<em>file handles) will be freed and this `Stream` will no longer be usable.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L194)  
> > &emsp;<em>Creates an independent `Stream` that operates on the same source material as this stream.</em>  
> > &emsp;<em>This sub-stream will be read-only.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/28b9923/src/file.ts#L195)  
> > &emsp;<em>Creates an independent `Stream` that operates on the same source material as this stream.</em>  
> > &emsp;<em>This sub-stream will be read-only.</em>  
> > &emsp;&#x25aa; from <sup><code>number</code></sup>  
> > &emsp;&#x25aa; to <sup><code>number</code></sup>  
>
> <a name="api-MemoryStream"></a>
> ### Class [`MemoryStream`](#api-MemoryStream)
> Source code: [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L37-L176)  
>  
> Methods:  
> > **new( )** <sup>&rArr; <code>[MemoryStream](#api-MemoryStream)</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L45-L66)  
> > &emsp;&#x25aa; options <sup><code>MemoryStreamOptionsWithData | MemoryStreamOptionsWithLength</code></sup>  
> > **.seek( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L80-L90)  
> > &emsp;<em>Changes the position of the next read in the stream.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup>  
> > **.read( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L92-L108)  
> > &emsp;<em>Reads some bytes from the stream.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup>  
> > **.readFrom( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L110-L116)  
> > &emsp;<em>Combines `seek` and `read`.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup>  
> > **.write( )** <sup>&rArr; <code>Promise&lt;number&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L118-L136)  
> > &emsp;<em>Writes some data to the stream.</em>  
> > &emsp;&#x25aa; data <sup><code>Buffer</code></sup>  
> > **.resize( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L138-L152)  
> > &emsp;<em>Resizes the source of this stream to a given number of bytes. Streams that </em>  
> > &emsp;<em>cannot be written to cannot be resized.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup>  
> > **.close( )** <sup>&rArr; <code>Promise&lt;void&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L154-L158)  
> > &emsp;<em>Closes this stream. Once it is closed, any underlying resources (memory buffers,</em>  
> > &emsp;<em>file handles) will be freed and this `Stream` will no longer be usable.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L160)  
> > &emsp;<em>Creates an independent `Stream` that operates on the same source material as this stream.</em>  
> > &emsp;<em>This sub-stream will be read-only.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/memory.ts#L161)  
> > &emsp;<em>Creates an independent `Stream` that operates on the same source material as this stream.</em>  
> > &emsp;<em>This sub-stream will be read-only.</em>  
> > &emsp;&#x25aa; from <sup><code>number</code></sup>  
> > &emsp;&#x25aa; to <sup><code>number</code></sup>  
>
> <a name="api-Stream"></a>
> ### Interface [`Stream`](#api-Stream)
> Source code: [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L3-L94)  
>  
> Methods:  
> > **.seek( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L41)  
> > &emsp;<em>Changes the position of the next read in the stream.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup> <em>The position to set the cursor to.</em>  
> > **.read( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L49)  
> > &emsp;<em>Reads some bytes from the stream.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup> <em>The maximum number of bytes to return.</em>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup> <em>If `true`, then this method will block until `length` bytes are available
or fail.</em>  
> > **.readFrom( )** <sup>&rArr; <code>Promise&lt;Buffer&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L58)  
> > &emsp;<em>Combines `seek` and `read`.</em>  
> > &emsp;&#x25aa; position <sup><code>number</code></sup> <em>The starting position to read from.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup> <em>The maximum number of bytes to return.</em>  
> > &emsp;&#x25ab; exact<sub>?</sub> <sup><code>undefined | true | false</code></sup> <em>If `true`, then this method will block until `length` bytes are available
or fail.</em>  
> > **.write( )** <sup>&rArr; <code>Promise&lt;number&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L65)  
> > &emsp;<em>Writes some data to the stream.</em>  
> > &emsp;&#x25aa; data <sup><code>Buffer</code></sup> <em>A `Buffer` containing the data to write.</em>  
> > **.resize( )** <sup>&rArr; <code>Promise&lt;boolean&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L73)  
> > &emsp;<em>Resizes the source of this stream to a given number of bytes. Streams that </em>  
> > &emsp;<em>cannot be written to cannot be resized.</em>  
> > &emsp;&#x25aa; length <sup><code>number</code></sup> <em>The new length of this stream.</em>  
> > **.close( )** <sup>&rArr; <code>Promise&lt;void&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L79)  
> > &emsp;<em>Closes this stream. Once it is closed, any underlying resources (memory buffers,</em>  
> > &emsp;<em>file handles) will be freed and this `Stream` will no longer be usable.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L87)  
> > &emsp;<em>Creates an independent `Stream` that operates on the same source material as this stream.</em>  
> > &emsp;<em>This sub-stream will be read-only.</em>  
> > **.substream( )** <sup>&rArr; <code>Promise&lt;[Stream](#api-Stream)&gt;</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L88)  
> > &emsp;&#x25aa; from <sup><code>number</code></sup>  
> > &emsp;&#x25aa; to <sup><code>number</code></sup>  
> > **.asNodeStream( )** <sup>&rArr; <code>Duplex</code></sup> [`<>`](http://github.com/laptou/ia-stream/blob/4e4edb3/src/stream.ts#L93)  
> > &emsp;<em>Converts this stream into a Node.js-style stream.</em>  
>  
> Properties:  
> > **.position** <sup><code>number</code></sup>  
> > &emsp;<em>The current position of the cursor in the stream.</em>  
> > **.length** <sup><code>number</code></sup>  
> > &emsp;<em>The length of the stream, in bytes.</em>  
> > **.canWrite** <sup><code>boolean</code></sup>  
> > &emsp;<em>`true` if this stream can be written to.</em>  
> > **.canRead** <sup><code>boolean</code></sup>  
> > &emsp;<em>`true` if this stream can be read from.</em>  
> > **.canSeek** <sup><code>boolean</code></sup>  
> > &emsp;<em>`true` if this stream can be seeked within.</em>  
> > **.isOpen** <sup><code>boolean</code></sup>  
> > &emsp;<em>`true` if this stream is currently open.</em>  

---

© 2019 Ibiyemi Abiodun (laptou) \<ibiyemi.a.abiodun@gmail.com\>