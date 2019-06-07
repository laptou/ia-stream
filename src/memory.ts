import { Stream, StreamBase } from "./stream";

interface MemoryStreamOptionsBase
{
    /**
     * Whether or not the internal buffer can expand after it is created.
     * This cannot be false if both @see {length} and @see {data} are not 
     * specified.
     */
    fixedSize?: boolean;
}

interface MemoryStreamOptionsWithData extends MemoryStreamOptionsBase
{
    /**
     * Buffer for this stream to operate on.
     */
    data: Buffer;

    /**
     * If this is `true`, then the stream will be read-only.
     */
    readonly?: boolean;

}

interface MemoryStreamOptionsWithLength extends MemoryStreamOptionsBase
{
    /**
     * The initial size of the buffer.
     */
    length: number;
}

type MemoryStreamOptions = MemoryStreamOptionsWithData | MemoryStreamOptionsWithLength;

export class MemoryStream extends StreamBase
{
    private _buffer: Buffer | null = null;
    private _position: number = 0;
    private _fixedSize: boolean;
    private _isOpen: boolean;
    private _isReadOnly: boolean;

    public constructor(options: MemoryStreamOptions)
    {
        super();

        if ("length" in options)
        {
            this._buffer = Buffer.alloc(options.length);
            this._isReadOnly = false;
        }
        else if ("data" in options)
        {
            this._buffer = options.data;
            this._isReadOnly = options.readonly || false;
        }
        else 
        {
            throw new Error("Must specify length or data.");
        }

        this._fixedSize = options.fixedSize || false;
        this._isOpen = true;
    }

    public get length()
    {
        return this._buffer!.byteLength;
    }

    public get position() { return this._position; }

    public get canRead() { return this.isOpen; }
    public get canSeek() { return this.canRead; }
    public get canWrite() { return this.isOpen && !this._isReadOnly; }
    public get isOpen() { return this._isOpen; }

    public async seek(position: number): Promise<boolean>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");

        if (position < 0 || position >= this.length)
            return false;

        this._position = position;
        return true;
    }

    public async read(length: number, exact?: boolean): Promise<Buffer>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");

        if (exact && this.position + length <= this.length)
            throw new Error(`Could not read ${length} bytes at position ${this.position}`);

        const slice = this._buffer!.slice(
            this.position,
            Math.min(this.length, this.position + length)
        );

        this._position += length;

        return slice;
    }

    public async readFrom(position: number, length: number, exact?: boolean): Promise<Buffer>
    {
        if (!await this.seek(position))
            throw new Error(`Could not seek to position ${position}.`);

        return this.read(length, exact);
    }

    public async write(data: Buffer): Promise<number>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canWrite)
            throw new Error("This stream cannot be written to.");

        if (this.position + data.byteLength > this.length)
        {
            if (this._fixedSize)
                throw new Error("Not enough space in buffer.");

            await this.resize(this.position + data.byteLength);
        }

        const bytesWritten = data.copy(this._buffer!, this.position);
        this._position += bytesWritten;
        return bytesWritten;
    }

    public async resize(length: number): Promise<boolean>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canWrite)
            throw new Error("This stream cannot be written to.");
        if (this._fixedSize)
            return false;

        const newBuf = Buffer.alloc(length);
        this._buffer!.copy(newBuf);
        this._buffer = newBuf;

        return true;
    }

    public async close()
    {
        this._buffer = null;
        this._isOpen = false;
    }

    public async substream(): Promise<Stream>;
    public async substream(from: number, to: number): Promise<Stream>;
    public async substream(from?: number, to?: number): Promise<Stream>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");

        let buf = this._buffer as Buffer;

        if (typeof from === "number")
        {
            buf = buf.slice(from, to);
        }

        return new MemoryStream({ data: buf, readonly: true });
    }
}